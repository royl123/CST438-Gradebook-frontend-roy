import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../constants.js';
import Cookies from 'js-cookie';

const NewAssignment = () => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const token = Cookies.get('XSRF-TOKEN');

  useEffect(() => {
    // Fetch the list of courses
    fetch(`${SERVER_URL}/gradebook`, {
      method: 'GET',
      headers: { 'X-XSRF-TOKEN': token },
    })
      .then((response) => response.json())
      .then((data) => {
        const uniqueCourses = [...new Map(data.assignments.map((courseObj) => [courseObj.courseId, courseObj])).values()];
        setCourses(uniqueCourses);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Find the selected course object based on the course title
    const selectedCourse = courses.find((courseObj) => courseObj.courseTitle === course);

    if (!selectedCourse) {
      console.error('Selected course not found.');
      return;
    }

    const assignmentData = {
      name,
      dueDate,
      course: selectedCourse.courseId,
    };

    // Make the POST request
    fetch(`${SERVER_URL}/courses/${selectedCourse.courseId}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify(assignmentData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Assignment created:', data);

        // Clear the form after successful submission
        setName('');
        setDueDate('');
        setCourse('');
      })
      .catch((error) => {
        console.error('Error creating assignment:', error);
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
          <br/>
          <label htmlFor="dueDate">Due Date: </label>
          <input
            type="text"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <br/>
          <label htmlFor="course">Course:</label>
          {courses.map((courseObj) => (
            <div key={courseObj.courseId}>
              <input
                type="radio"
                id={courseObj.courseId}
                name="course"
                value={courseObj.courseTitle}
                checked={course === courseObj.courseTitle}
                onChange={(e) => setCourse(e.target.value)}
              />
              <label htmlFor={courseObj.courseId}>{courseObj.courseTitle}</label>
            </div>
          ))}
        </div>
        <br />
        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
};

export default NewAssignment;