import React from 'react';
import Contact from 'components/Contact';
import { StarsCanvas } from 'components/canvas';
export const Cont = () => {
  return (
    <div className="bg-black">
      <div className="relative z-10">
        <Contact />
      </div>
      <StarsCanvas />
    </div>
  );
};
