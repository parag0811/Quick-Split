"use client";
import { useEffect } from "react";

export default function Home(){
  useEffect(() => {
    fetch("http://localhost:5000")
    .then(res => res.text())
    .then(data => console.log(data))
  }, [])

  return <div>Quick Split</div>
}