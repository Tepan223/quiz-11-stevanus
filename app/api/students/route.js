import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'students.json');

export async function GET() {
  let students = [];
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    students = JSON.parse(data);
  } catch (err) {
    console.error("Error reading students.json:", err);
    students = [];
  }
  return NextResponse.json(students);
}

export async function POST(req) {
  try {
    let students = [];
    try {
      const data = fs.readFileSync(dataFilePath, "utf8");
      students = JSON.parse(data);
    } catch (error) {
      students = []; 
    }

    const newStudent = await req.json();

    const lastId = students.length > 0 
      ? Math.max(...students.map(s => parseInt(s.id))) 
      : 0;
    newStudent.id = (lastId + 1).toString();

    students.push(newStudent);

    fs.writeFileSync(dataFilePath, JSON.stringify(students, null, 2));

    return NextResponse.json({ message: "Student added", data: newStudent });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json(
      { message: "Failed to save student", error: err.message },
      { status: 500 }
    );
  }
}
