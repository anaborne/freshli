import { useEffect, useRef, useState } from 'react';

type Recipe = {
  name: string;
  decription: string;
  ingredients: Array<string>;
  instructions: Array<string>;
};

export default function RecipeDisplay({ name, description, ingredients, instructions }: Recipe) {

  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
      <p>{ingredients}</p>
      <p>{instructions}</p>
    </div>
  );
}