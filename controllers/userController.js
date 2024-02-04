const { User } = require('../models');

// Aggregate function to get the number of users overall
const totalUsers = async () => {
  const numberOfUsers = await User.aggregate()
    .count('usertCount');
  return numberOfUsers;
}

module.exports = {

  // Get all users
  async getUsers(req, res) {
    try {
      const users = await User.find();

      const userObj = {
        users,
        totalUsers: await totalUsers(),
      };

      res.json(userObj);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // Get a single user
  async getSingleUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.userId })
        .select('-__v');

      if (!user) {
        return res.status(404).json({ message: 'No user with that ID' })
      }

      res.json({
        user
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  // create a new user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Delete a user 
  async deleteUser(req, res) {
    try {
      const user = await User.findOneAndDelete({ _id: req.params.userId });

      if (!user) {
        return res.status(404).json({ message: 'No such user exists' });
      }

      res.json({ message: 'User successfully deleted' });
    } 
    catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Update a user
  async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
        { runValidators: true, new: true }
      );

      if (!user) {
        res.status(404).json({ message: 'No user with this id!' });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Add a friend
  async addFriend(req, res) {
    try {
      const { userId, friendId } = req.params;
      
      const user = await User.findById(userId);
      
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      if (!user.friends.includes(friendId)) {
          user.friends.push(friendId);
          await user.save();
          return res.status(200).json({ message: 'Friend added successfully' });
      } else { 
          return res.status(200).json({ message: 'Friend already added' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  // Remove a friend
  async removeFriend(req, res) {
    try {
      const { userId, friendId } = req.params;
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.friends.includes(friendId)) {
        user.friends.remove(friendId);
        await user.save();
        return res.status(200).json({ message: 'Friend removed successfully' });
      } else {
        return res.status(400).json({ error: 'Friend not found in the user\'s friends list' });
      }
    } catch (err) {
      console.error("Error removing friend:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
