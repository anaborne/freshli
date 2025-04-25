import { useEffect, useRef, useState } from 'react';

type Recipe = {
  name: string;
  decription: string;
  ingredients: Array<string>;
  instructions: Array<string>;
};

const listStyle = {
  'list-style-type': 'decimal',
  'list-style-position': 'inside',
}

export default function RecipeDisplay({ name, description, ingredients, instructions }: Recipe) {

  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>

      <h2>Ingredients</h2>
      <ol style={listStyle}>
      {ingredients.map((ingredient, index) => (
        <li key={index}>{ingredient}</li>
      ))}
      </ol>

      <h2>Instructions</h2>
      <ol style={listStyle}>
      {instructions.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
      </ol>
    </div>
  );
}