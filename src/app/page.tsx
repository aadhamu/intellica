'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Image from 'next/image';
import {FaEye, FaEyeSlash} from  'react-icons/fa';
export default function App() {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const[password, setPassword] = useState('');
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const [show, setShow] = useState(true);
  const boxVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.5 } }
  };

  return (
    <motion.div
      variants={boxVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: 30,
        backgroundColor: '#F1EFE9',  // Light background color
        borderRadius: 10,             // Rounded corners
        textAlign: 'center',
        marginTop: '5%',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '80%',
                     // Max width for better control
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Add subtle shadow
      }}
    >
      <div className="row align-items-center">
        <div className="col-12 col-md-6 mb-4 mb-md-0 text-center">
          <Image 
            src="/image/login.png"  // public folder path
            alt="AI Robot"
            width={400}
            height={400}
            style={{ borderRadius: 10 }}
          />
        </div>
        <div className="col-12 col-md-6">
          <h3 className="mb-4">Welcome Back!</h3>
          <Form.Floating className="mb-3">
            <Form.Control
              id="floatingInputCustom"
              type="email"
              placeholder="name@example.com"
            />
            <label htmlFor="floatingInputCustom">Email address</label>
          </Form.Floating>
          <Form.Floating>
            <Form.Control
              id="floatingPasswordCustom"
              type="{passwordVisible ? 'text' : 'password'}// Toggle the type based on state"
              placeholder="Password"
            />
            <label htmlFor="floatingPasswordCustom">Password</label>
          </Form.Floating>
          <Button variant="primary" type="submit" className="mt-4 w-100">
            Submit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
