import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();
    console.log('Received ingredients:', ingredients);

    // Get current inventory
    const { data: inventory, error: fetchError } = await supabase
      .from('ingredients')
      .select('*');

    if (fetchError) {
      console.error('Error fetching inventory:', fetchError);
      throw fetchError;
    }

    console.log('Current inventory:', inventory);

    // Process each ingredient from the recipe
    for (const ingredientStr of ingredients) {
      // Parse ingredient in format "Ingredient (quantity unit)"
      const match = ingredientStr.match(/([^(]+)\s*\((\d+)\s+([^)]+)\)/);
      if (match) {
        const [, name, quantityStr, unit] = match;
        const ingredientName = name.trim().toLowerCase();
        const quantity = parseInt(quantityStr);
        
        console.log('Parsed ingredient:', { name: ingredientName, quantity, unit });

        // Find the matching inventory item
        const inventoryItem = inventory?.find(
          item => item.name.toLowerCase() === ingredientName
        );

        if (inventoryItem) {
          console.log('Found matching inventory item:', inventoryItem);
          const currentQuantity = parseFloat(inventoryItem.quantity);
          const newQuantity = currentQuantity - quantity;
          
          if (newQuantity >= 0) {
            const { error: updateError } = await supabase
              .from('ingredients')
              .update({ quantity: newQuantity.toString() })
              .eq('id', inventoryItem.id);

            if (updateError) {
              console.error('Error updating inventory:', updateError);
              throw updateError;
            }
          } else {
            console.log('Not enough quantity in inventory:', {
              current: currentQuantity,
              needed: quantity,
            });
          }
        } else {
          console.log('No matching inventory item found for:', ingredientName);
        }
        continue;
      }

      // For basic ingredients like "Salt and Pepper", "Olive Oil"
      const basicIngredient = ingredientStr.trim().toLowerCase();
      console.log('Processing basic ingredient:', basicIngredient);

      // Find the matching inventory item
      const inventoryItem = inventory?.find(
        item => item.name.toLowerCase() === basicIngredient
      );

      if (inventoryItem) {
        console.log('Found matching inventory item:', inventoryItem);
        const currentQuantity = parseFloat(inventoryItem.quantity);
        const newQuantity = currentQuantity - 1;
        
        if (newQuantity >= 0) {
          const { error: updateError } = await supabase
            .from('ingredients')
            .update({ quantity: newQuantity.toString() })
            .eq('id', inventoryItem.id);

          if (updateError) {
            console.error('Error updating inventory:', updateError);
            throw updateError;
          }
        }
      } else {
        console.log('No matching inventory item found for:', basicIngredient);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update inventory' },
      { status: 500 }
    );
  }
} 