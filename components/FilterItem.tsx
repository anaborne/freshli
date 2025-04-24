import { useEffect, useRef, useState } from 'react';

type Props = {
  filter: string;
  onChange: func;
};

export default function FilterItem({ filter, onChange }: Props) {

  return (
    <div>
      <input type="checkbox" onChange={(e) => {
          const checked = e.target.checked;
          onChange(filter, checked);
        }} />
      <label>{filter}</label>
    </div>
  );
}