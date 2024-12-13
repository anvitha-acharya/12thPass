// app.js


const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const cors = require('cors');
app.use(cors());
// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/learn', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const filter = req.query.filter || '';

    try {
        const edxApiResponse = await axios.get(`http://localhost:3000/courses`, {
            params: { page, search, filter },
        });

        // Check if courses are returned properly
        const courses = edxApiResponse.data.courses || []; // Ensure courses is always an array

        res.render('learn', {
            courses, // Pass courses as an array
            currentPage: edxApiResponse.data.currentPage,
            totalPages: edxApiResponse.data.totalPages,
            search,
            filter,
        });
    } catch (error) {
        console.error('Error fetching courses:', error.message);
        res.status(500).send('Failed to fetch courses');
    }
});





app.get('/courses', async (req, res) => {
    const edxApiUrl = 'https://courses.edx.org/api/courses/v1/courses/';
    const allowedSubjects = ['physics', 'science', 'mathematics', 'biology', 'computer science', 'economics'];

    try {
        const response = await axios.get(edxApiUrl, {
            params: {
                page: req.query.page || 1,
                page_size: req.query.page_size || 10,
            },
        });

        // Filter courses based on subjects or keywords
        const courses = response.data.results.filter(course => {
            const courseSubjects = course.subjects || [];
            const courseTitle = course.name.toLowerCase();
            const courseDescription = (course.short_description || '').toLowerCase();

            return courseSubjects.some(subject => 
                allowedSubjects.includes(subject.toLowerCase())
            ) || allowedSubjects.some(keyword =>
                courseTitle.includes(keyword) || courseDescription.includes(keyword)
            );
        });

        // Return courses, currentPage, and totalPages in response
        res.json({
            courses, 
            currentPage: req.query.page || 1,
            totalPages: response.data.pagination.total_pages
        });
    } catch (error) {
        console.error('Error fetching edX courses:', error.message);
        res.status(500).send('Failed to fetch courses');
    }
});

    
// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
