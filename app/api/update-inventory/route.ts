import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { parseRecipeIngredient, planDeduction } from '@/lib/ingredients';

type InventoryRow = {
  id: number | string;
  name: string;
  quantity: string | number;
  unit: string;
  expiration_date: string;
};

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase();

/**
 * A recipe line is either "Name (quantity unit)" or a basic essential with no quantity,
 * and a quantity-less line deducts one unit. Parsing lives in lib/ingredients so the
 * tests cover it: the regex that used to be inline here matched integers only, so
 * "Chicken Thighs (1.5 lb)" took the quantity-less path and deducted 1.
 *
 * Inventory is matched on the name and the unit the parser read, which is the identity
 * the rest of the app uses (mergeKey in lib/ingredients). Keying it by name alone hid
 * every batch but the last row Postgres happened to return, and it let a line measured
 * in tbsp decrement a row stored in lb. Where several batches match, planDeduction takes
 * the soonest to expire first.
 */
export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();
    if (!Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Expected an ingredients array' }, { status: 400 });
    }

    const { data: inventory, error: fetchError } = await supabase.from('ingredients').select('*');
    if (fetchError) throw fetchError;

    const rows = (inventory ?? []) as InventoryRow[];

    const applied: string[] = [];
    const skipped: { line: string; reason: string }[] = [];

    for (const line of ingredients as string[]) {
      const parsed = parseRecipeIngredient(line);
      const name = normalize(parsed?.name ?? line);
      const unit = parsed ? normalize(parsed.unit) : null;
      const used = parsed?.quantity ?? 1;

      // A line with no quantity carries no unit either, so it matches on the name alone.
      const batches = rows.filter(
        (row) => normalize(row.name) === name && (unit === null || normalize(row.unit) === unit),
      );
      if (batches.length === 0) {
        skipped.push({ line, reason: 'not in inventory' });
        continue;
      }

      const plan = planDeduction(
        batches.map((row) => ({ quantity: row.quantity, expirationDate: row.expiration_date })),
        used,
      );
      if (!plan.ok) {
        skipped.push({ line, reason: plan.reason });
        continue;
      }

      for (const deduction of plan.deductions) {
        const row = batches[deduction.index];
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ quantity: String(deduction.remaining) })
          .eq('id', row.id);
        if (updateError) throw updateError;
        // Later lines in the same request read the level this line left behind.
        row.quantity = String(deduction.remaining);
      }
      applied.push(line);
    }

    // Reported instead of logged and dropped: a caller that sends five lines
    // and has two silently ignored should be able to see which two. A request where
    // every line was skipped deducted nothing, so it does not report success.
    return NextResponse.json({ success: applied.length > 0, applied, skipped });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update inventory' },
      { status: 500 },
    );
  }
}
