import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'students.json');

export async function GET(_, { params }) {
  const { id } = await params;
  let students = [];
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    students = JSON.parse(data);
  } catch (err) {
    console.error("Error reading students.json:", err);
    students = [];
  }
  const student = students.find((s) => s.id == id);
  return NextResponse.json(student || { message: "Not Found" }, { status: student ? 200 : 404 });
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  let students = [];
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    students = JSON.parse(data);
  } catch (err) {
    console.error("Error reading students.json:", err);
    students = [];
  }
  const index = students.findIndex((s) => s.id == id);
  if (index === -1) return NextResponse.json({ message: "Not Found" }, { status: 404 });

  students.splice(index, 1);
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(students, null, 2));
  } catch (err) {
    console.error("Error writing to students.json:", err);
    return NextResponse.json({ message: "Failed to save after delete" }, { status: 500 });
  }
  return NextResponse.json({ message: "Deleted successfully" });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  let students = [];
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    students = JSON.parse(data);
  } catch (err) {
    console.error("Error reading students.json:", err);
    students = [];
  }
  const updatedData = await req.json();
  const index = students.findIndex((s) => s.id == id);

  if (index === -1) return NextResponse.json({ message: "Not Found" }, { status: 404 });

  students[index] = { ...students[index], ...updatedData };
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(students, null, 2));
  } catch (err) {
    console.error("Error writing to students.json:", err);
    return NextResponse.json({ message: "Failed to save after update" }, { status: 500 });
  }
  return NextResponse.json({ message: "Updated successfully", data: students[index] });
}
