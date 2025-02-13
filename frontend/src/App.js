import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./pages/Header";
import Timeline from "./pages/Timeline";
import Robote from "./pages/Robote";
import Home from "./pages/Home";

import Register from "../src/store/Register"; // Register component for registration

import Homepageevents from "./pages/Homepageevents";
import Footer from "./pages/Footer";

import Gdg from "./pages/Gdg";
import Onspotevents from "./pages/Onspotevents";
import Cs from "./pages/Cs";
import Civil from "./pages/Civil";
import Mech from "./pages/Mech";
import Pahal from "./pages/Pahal";
import Sports from "./pages/Sports";
import Cdips from "./pages/Cdips";
import Cdip from "./pages/Cdip";
import Management from "./pages/Management";
import Law from "./pages/law";
import Specialevents from "./pages/Specialevents";

import Logos from "./pages/Logos";
import axios from "axios";
import Loader from "./pages/Loader";


const App = () => {
  const footerRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loader state
  const [requestCount, setRequestCount] = useState(0); // Counter for active requests

  // Function to smoothly scroll to the footer
  const scrollToFooter = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update loading state when requestCount changes
  useEffect(() => {
    // If there are no active requests, hide the loader
    if (requestCount === 0) {
      setLoading(false);
    } else {
      setLoading(true); // Show loader if there are active requests
    }
  }, [requestCount]);

  // Add Axios interceptors
  axios.interceptors.request.use(
    (config) => {
      console.log("Request Interceptor: Request started");
      setRequestCount((prev) => prev + 1); // Increment request count
      return config;
    },
    (error) => {
      console.log("Request Interceptor: Request failed", error);
      setRequestCount((prev) => prev - 1); // Decrement request count
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log("Response Interceptor: Request succeeded", response);
      setRequestCount((prev) => prev - 1); // Decrement request count
      return response;
    },
    (error) => {
      setRequestCount((prev) => prev - 1); // Decrement request count
      return Promise.reject(error);
    }
  );

  return (
    <Router>
      <div className="App">
        {loading && <Loader />} {/* Show loader when loading is true */}
        <Header scrollToFooter={scrollToFooter} />
        <Routes>
          <Route path="/Logos" element={<Logos />} />

          <Route path="/register" element={<Register />} /> {/* Register route */}

          <Route path="/Timeline" element={<Timeline />} />

          <Route path="/Homepageevents" element={<Homepageevents />} />

          <Route path="/Robote" element={<Robote />} />
          <Route path="/Cs" element={<Cs />} />

          <Route path="/Specialevents" element={<Specialevents />} />
          <Route path="/Cdip" element={<Cdip />} />
          <Route path="/Management" element={<Management />} />
          <Route path="/Law" element={<Law />} />
          <Route path="/Cdips" element={<Cdips />} />
          <Route path="/Sports" element={<Sports />} />
          <Route path="/Pahal" element={<Pahal />} />
          <Route path="/Onspotevents" element={<Onspotevents />} />
          <Route path="/Civil" element={<Civil />} />
          <Route path="/Mech" element={<Mech />} />
          <Route path="/" element={<Home />} />
          <Route path="/Gdg" element={<Gdg />} />
        </Routes>
        <Footer ref={footerRef} />
      </div>
    </Router>
  );
};

export default App;
