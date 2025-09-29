
import express from 'express';
import mongoose from 'mongoose';
import Board from '../models/Board.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all tasks
router.get('/tasks', async (req, res) => {
  try {
    const { status } = req.query;
    const boards = await Board.find();
    let allTasks = boards.flatMap(board => board.tasks);
    if (status) {
      allTasks = allTasks.filter(task => task.status === status);
    }
    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new board
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const newBoard = new Board({ name, description });
    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//   List tasks  
router.get('/:boardId/tasks', async (req, res) => {
  try {
    const { boardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(board.tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post('/:boardId/tasks', async (req, res) => {
  const { boardId } = req.params;
  const { title, description, status = 'todo', priority = 'medium', assignedTo = '', dueDate = '' } = req.body;
  console.log('POST task - boardId:', boardId, 'data:', req.body);
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }
    console.log('Finding board...');
    const board = await Board.findById(boardId);
    console.log('Board found:', !!board);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    let parsedDueDate;
    if (dueDate && dueDate.trim()) {
      try {
        parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
          parsedDueDate = undefined;
        }
      } catch {
        parsedDueDate = undefined;
      }
    } else {
      parsedDueDate = undefined;
    }
    const newTask = {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate: parsedDueDate
    };
    console.log('Creating new task subdocument...');
    const newTaskDoc = await board.tasks.create(newTask);
    console.log('New task created:', newTaskDoc);
    console.log('Saving board...');
    await board.save();
    console.log('Board saved successfully');
    res.status(201).json(newTaskDoc);
  } catch (error) {
    console.error('Error in POST task:', error);
    res.status(500).json({ error: error.message });
  }
});

//  Update a task
router.put('/:boardId/tasks/:taskId', async (req, res) => {
  const { boardId, taskId } = req.params;
  const updates = req.body;
  console.log('PUT task - boardId:', boardId, 'taskId:', taskId, 'updates:', updates);
  if (updates.dueDate !== undefined) {
    if (updates.dueDate && updates.dueDate.trim()) {
      try {
        const parsedDueDate = new Date(updates.dueDate);
        if (isNaN(parsedDueDate.getTime())) {
          updates.dueDate = undefined;
        } else {
          updates.dueDate = parsedDueDate;
        }
      } catch {
        updates.dueDate = undefined;
      }
    } else {
      updates.dueDate = undefined;
    }
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: 'Invalid board or task ID' });
    }
    console.log('Building $set object for partial update...');
    const setObj = {};
    for (const key in updates) {
      setObj[`tasks.$.${key}`] = updates[key];
    }
    console.log('Set object:', setObj);
    const board = await Board.findOneAndUpdate(
      { _id: boardId, 'tasks._id': taskId },
      { $set: setObj },
      { new: true }
    );
    console.log('Board updated:', !!board);
    if (!board) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const updatedTask = board.tasks.id(taskId);
    console.log('Updated task:', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error in PUT task:', error);
    res.status(500).json({ error: error.message });
  }
});

//  Delete a task
router.delete('/:boardId/tasks/:taskId', async (req, res) => {
  const { boardId, taskId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: 'Invalid board or task ID' });
    }
    const board = await Board.findByIdAndUpdate(
      boardId,
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
