import React, { useState, useEffect } from "react";
import { SERVER_URL } from "../constants.js";
import Cookies from "js-cookie";
import Button from "@mui/material/Button";

const NewAssignment = () => {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const token = Cookies.get("XSRF-TOKEN");

  useEffect(() => {
    // Fetch the list of courses
    fetch(`${SERVER_URL}/gradebook`, {
      method: "GET",
      headers: { "X-XSRF-TOKEN": token },
    })
      .then((response) => response.json())
      .then((data) => {
        const uniqueCourses = [
          ...new Map(
            data.assignments.map((courseObj) => [courseObj.courseId, courseObj])
          ).values(),
        ];
        setCourses(uniqueCourses);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Find the selected course object based on the course title
    const selectedCourse = courses.find(
      (courseObj) => courseObj.courseTitle === course
    );

    if (!selectedCourse) {
      console.error("Selected course not found.");
      return;
    }

    const assignmentData = {
      assignmentName: name,
      dueDate,
      courseTitle: selectedCourse.courseTitle,
      courseId: selectedCourse.courseId,
    };

    console.log("Assignment data:", assignmentData);

    // Make the POST request
    fetch(`${SERVER_URL}/course/${selectedCourse.courseId}/assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      body: JSON.stringify(assignmentData),
    })
      .then((response) => {
        if (response.ok) {
          setSuccessMessage("Assignment added!");
            // Clear the form after successful submission
          setName("");
          setDueDate("");
          setCourse("");
          return response.json();
        } else {
          setErrorMessage("Error encountered");
          throw new Error("Error encountered");
        }
      })
      .then((data) => {
        console.log("Assignment created:", data);
      })
      .catch((error) => {
        if (error.message !== "SyntaxError: Unexpected end of JSON input") {
          console.error("Error encountered: ", error);
        }
      });
  };

  return (
    <div>
      <h2>New Assignment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <br />
          <label htmlFor="dueDate">Due Date: </label>
          <input
            type="text"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="yyyy-mm-dd"
          />
        </div>
        <div>
          <br />
          <label htmlFor="course">Course:</label>
          {courses.length > 0 ? (
            courses.map((courseObj) => (
              <div key={courseObj.courseId}>
                <input
                  type="radio"
                  id={courseObj.courseId}
                  name="course"
                  value={courseObj.courseTitle}
                  checked={course === courseObj.courseTitle}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <label htmlFor={courseObj.courseId}>
                  {courseObj.courseTitle}
                </label>
              </div>
            ))
          ) : (
            <div>No courses available</div>
          )}
        </div>
        <br />
        <Button variant="outlined" color="success"type="submit">Create Assignment</Button>
        <br />
        {successMessage && <p style={{ color: 'green', fontWeight: 'bold'}}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red', fontWeight: 'bold'}}>{errorMessage}</p>}
        <br />
      </form>
    </div>
  );
};

export default NewAssignment;
