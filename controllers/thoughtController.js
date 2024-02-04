const { Thought } = require('../models');
const { User } = require('../models');
const reactionSchema = require ('../models/reactions')

module.exports = {

  // Get all thoughts
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find();

      const thoughtObj = {thoughts};

      res.json(thoughtObj);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Get a single thought
  async getSingleThought(req, res) {
    try {
      const thought = await Thought.findOne({ _id: req.params.thoughtId })
        .select('-__v');

      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' })
      }

      res.json({
        thought
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // create a new thought
  async createThought(req, res) {
    try {
      const thought = await Thought.create(req.body);
      const user = await User.findById(req.body.userId);
      user.thoughts.push(thought._id);
      await user.save();
      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete a user 
  async deleteThought(req, res) {
    try {
      const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

      if (!thought) {
        return res.status(404).json({ message: 'No such thought exists' });
      }

      res.json({ message: 'Thought successfully deleted' });
    } 
    catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Update a thought
  async updateThought(req, res) {
    try {
      const thought = await Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!thought) {
        res.status(404).json({ message: 'No thought with this id!' });
      }

      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // create a new reaction
  async createReaction(req, res) {
    try {
      const { thoughtId, reactionBody, username } = req.body;
  
      const thought = await Thought.findById(thoughtId);
  
      if (!thought) {
        return res.status(404).json({ message: 'No thought found' });
      }
  
      const newReaction = {
        reactionBody,
        username
      };
  
      thought.reactions.push(newReaction);
  
      await thought.save();
  
      res.status(201).json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  },
};
