const express = require('express')
// const User = require('../models/Users')
const router = express.Router();
const Notes = require('../models/Notes');
const fetchUser = require('../middleware/fetchuser');
const {
    body,
    validationResult
} = require('express-validator');
// const { findById, findByIdAndUpdate } = require('../models/Notes');

//Route 1 : To fetch the notes os a user
router.get('/fetchallnotes', fetchUser,async (req, res) => {
    try {
        console.log(req.user.id)
        const notes =await Notes.find({
            user: req.user.id 
        });
        req.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500, 'Internal servor error')
    }
})
//Route 2 :Add a new note of a user
router.post('/addnote', fetchUser, [body('title', 'Enter a valid Title').isLength({
        min: 3
    }),
    body('description', 'Enter a valid description').isLength({
        min: 5
    }),
],fetchUser, (req, res) => {

    const {
        title,
        description,
        tag
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    try {
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        })
        const saveNote = note.save();
        res.json(saveNote)
    } catch (error) {
        console.error(error.message)
        res.status(500, 'Internal servor error')
    }

})

//Route 3: update the existing note of a user

router.put('/updatenote/:id',fetchUser,async(req,res)=>{
    const {title,description,tag} = req.body;
    const newNote = {}
    if(title){newNote.title=title}
    if(description){newNote.description=description}
    if(tag){newNote.tag=tag}

    let note =await Notes.findById(req.params.id);
    console.log(note.user)
    console.log(req.params.id)
    if(!note){return res.status(401).send("Not Found!")}
    
    if(note.user.toString()!==req.user.id)
    {return res.status(401).send("Not Allowed!!");}

    note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})
})



//Route 4: delete the existing note of a user

router.delete('/deletenote/:id',fetchUser,async(req,res)=>{
    
    let note =await Notes.findById(req.params.id);
    console.log(note)
    if(!note){return res.status(401).send("Not Found!")}
    
    if(note.user.toString()!==req.user.id)
    {return res.status(401).send("Not Allowed!!");}

    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({"Success":"Note deleted succesfully",note:note})
})
module.exports = router