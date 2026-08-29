import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { parseRecipeIngredient } from '@/lib/ingredients';

/**
 * A recipe line is either "Name (quantity unit)" or a basic essential with no quantity,
 * and a quantity-less line deducts one unit. Parsing lives in lib/ingredients so the
 * tests cover it: the regex that used to be inline here matched integers only, so
 * "Chicken Thighs (1.5 lb)" took the quantity-less path and deducted 1.
 */
export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();
    if (!Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Expected an ingredients array' }, { status: 400 });
    }

    const { data: inventory, error: fetchError } = await supabase.from('ingredients').select('*');
    if (fetchError) throw fetchError;

    const byName = new Map<string, { id: number | string; quantity: string | number }>();
    for (const row of inventory ?? []) {
      byName.set(String(row.name).trim().toLowerCase(), row);
    }

    const applied: string[] = [];
    const skipped: { line: string; reason: string }[] = [];

    for (const line of ingredients as string[]) {
      const parsed = parseRecipeIngredient(line);
      const name = (parsed?.name ?? line).trim().toLowerCase();
      const used = parsed?.quantity ?? 1;

      const row = byName.get(name);
      if (!row) {
        skipped.push({ line, reason: 'not in inventory' });
        continue;
      }

      const current = Number.parseFloat(String(row.quantity));
      if (!Number.isFinite(current)) {
        skipped.push({ line, reason: 'inventory quantity is not a number' });
        continue;
      }

      const remaining = current - used;
      if (remaining < 0) {
        skipped.push({ line, reason: `needs ${used}, inventory has ${current}` });
        continue;
      }

      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ quantity: String(remaining) })
        .eq('id', row.id);
      if (updateError) throw updateError;
      applied.push(line);
    }

    // Reported rather than logged and dropped: a caller that sends five lines
    // and has two silently ignored should be able to see which two.
    return NextResponse.json({ success: true, applied, skipped });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update inventory' },
      { status: 500 },
    );
  }
}
