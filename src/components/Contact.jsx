import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { DecoderText } from 'components/DecoderText';
import { Heading } from 'components/Heading';
import { Divider } from 'components/Divider';
import { Input } from 'components/Input';
import cstyles from './Contact.module.css';
import { useFormInput } from 'hooks';

import { styles } from '../styles';
import { EarthCanvas } from './canvas';
import { SectionWrapper } from '../hoc';
import { slideIn } from '../utils/motion';
import { tokens } from 'components/ThemeProvider/theme';
import { cssProps, msToNum, numToMs } from 'utils/style';

const Contact = () => {
  const formRef = useRef();
  const initDelay = tokens.base.durationS;
  const email = useFormInput('');
  const message = useFormInput('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: 'JavaScript Mastery',
          from_email: form.email,
          to_email: 'sujata@jsmastery.pro',
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          alert('Thank you. I will get back to you as soon as possible.');

          setForm({
            name: '',
            email: '',
            message: '',
          });
        },
        error => {
          setLoading(false);
          console.error(error);

          alert('Ahh, something went wrong. Please try again.');
        }
      );
  };

  function getDelay(delayMs, offset = numToMs(0), multiplier = 1) {
    const numDelay = msToNum(delayMs) * multiplier;
    return cssProps({ delay: numToMs((msToNum(offset) + numDelay).toFixed(0)) });
  }

  return (
    <div
      className={`md:mt-14 min-w-[900px]:ml-16 flex min-[900px]:flex-row flex-col-reverse overflow-hidden`}
    >
      <motion.div
        variants={slideIn('left', 'tween', 0.2, 1)}
        className="flex-[0.75] bg-black-100 p-8 rounded-2xl"
      >
        <Heading
          className={styles.title}
          data-status={status}
          level={3}
          as="h1"
          style={getDelay(tokens.base.durationXS, initDelay, 0.3)}
        >
          <DecoderText text="Say hello" start={status !== 'exited'} delay={300} />
        </Heading>
        <Divider
          className={`${styles.divider} mt-5`}
          data-status={status}
          style={getDelay(tokens.base.durationXS, initDelay, 0.4)}
        />
        <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
          <Input
            required
            multiline
            className={styles.input}
            data-status={status}
            style={getDelay(tokens.base.durationS, initDelay)}
            autoComplete="off"
            label="Name"
            maxLength={4096}
            {...message}
          />
          <Input
            required
            className={styles.input}
            data-status={status}
            style={getDelay(tokens.base.durationXS, initDelay)}
            autoComplete="email"
            label="Your Email"
            type="email"
            maxLength={512}
            {...email}
          />
          <Input
            required
            multiline
            className={styles.input}
            data-status={status}
            style={getDelay(tokens.base.durationS, initDelay)}
            autoComplete="off"
            label="Message"
            maxLength={4096}
            {...message}
          />

          <button
            type="submit"
            className="bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn('right', 'tween', 0.2, 1)}
        className="xl:flex-1 flex justify-center xl:h-auto md:h-[450px] lg:h-[550px] h-[350px]"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, 'contact');
