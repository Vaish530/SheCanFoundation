const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    role: {
        type: String,
        required: [true, 'Area of interest is required'],
        enum: ['advocacy', 'outreach', 'training', 'fundraising']
    },
    message: {
        type: String,
        required: [true, 'Message/cover letter is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
