import React from 'react';
import Contact from 'components/Contact';
import { StarsCanvas } from 'components/canvas';
export const Cont = () => {
  return (
    <div className="bg-black">
      <Contact />
      <StarsCanvas />
    </div>
  );
};
