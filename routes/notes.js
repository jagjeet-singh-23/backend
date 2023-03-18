const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
// Here, we will be implementing CRUD operations: Create, Read, Update, Delete

// ROUTE 1(Read): Get all notes of logged in users. GET "/api/notes/fetchallnotes".Login Required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        // catch server errors, if any,
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})
// ROUTE 2(Create): Adds a new note using POST "/api/notes/addnote". Login Required
router.post('/addnote', fetchUser, [
    // Validating requirements to create a new note
    body('title', 'Enter a valid title (atleast 5 characters)').isLength({ min: 5 }),
    body('description', 'Description must be alteast 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    try {
        // If there are any errors, return BadRequest and error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // If no error occurs, proceed with creating newNote
        const { title, description, tag } = req.body;
        const newNote = new Notes({
            title, description, tag, user: req.user.id
        });
        const savedNote = await newNote.save();
        res.json(savedNote);
    } catch (error) {
        // catch server errors, if any,
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

// ROUTE 3(Update): Update an existing note using PUT "/api/notes/updatenote". Login Required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    // Create a newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    // Check whether this even exists in the database
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") };

    // Check whether the user is genuine or not
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Unauthorized");
    }
    try {
        // Find the note by its ID and then update it
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (error) {
        // catch server errors, if any,
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
// ROUTE 4(Delete): Delete an existing note using DELETE "/api/notes/deletenote". Login Required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {

    // Check whether this even exists in the database
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") };

    // Check whether this note belongs to the same user requesting to delete the note
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Unauthorized");
    }
    try {
        // Find the note by its ID and then delete it
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note deleted successfully", note: note });
    } catch (error) {
        // catch server errors, if any,
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router; 