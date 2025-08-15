import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KanbanBoard.css';

const KanbanBoard = () => {
  // Board states
  const [activeBoard, setActiveBoard] = useState('web');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    status: 'set'
  });

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState(null);

  // API base URL
  const API_BASE_URL = 'https://nickly24-tekmanbot-fa61.twc1.net';

  // Fetch tasks based on active board
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const endpoint = activeBoard === 'web' 
          ? '/api/web_canban' 
          : '/api/tsd_android_canban';
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        setTasks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks. Please try again later.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeBoard]);

  // Handle board change
  const handleBoardChange = (board) => {
    setActiveBoard(board);
  };

  // Handle task status change (drag and drop)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const endpoint = activeBoard === 'web' 
        ? '/api/web_canban/update' 
        : '/api/tsd_android_canban/update';
      
      await axios.put(`${API_BASE_URL}${endpoint}`, {
        id: taskId,
        status: newStatus
      });

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      const endpoint = activeBoard === 'web' 
        ? '/api/web_canban/delete' 
        : '/api/tsd_android_canban/delete';
      
      await axios.delete(`${API_BASE_URL}${endpoint}`, {
        data: { id: taskId }
      });

      setTasks(tasks.filter(task => task.id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeBoard === 'web' 
        ? '/api/web_canban' 
        : '/api/tsd_android_canban';
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, newTask);
      
      setTasks([...tasks, response.data]);
      setNewTask({ task: '', description: '', status: 'set' });
      setShowTaskForm(false);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Filter tasks by status
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    handleStatusChange(parseInt(taskId), newStatus);
  };

  return (
    <div className="kanban-container">
      {/* Board selector */}
      <div className="board-selector">
        <button
          className={`board-btn ${activeBoard === 'web' ? 'active' : ''}`}
          onClick={() => handleBoardChange('web')}
        >
          Web Interface
        </button>
        <button
          className={`board-btn ${activeBoard === 'tsd' ? 'active' : ''}`}
          onClick={() => handleBoardChange('tsd')}
        >
          TSD Android
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading state */}
      {loading && <div className="loading">Loading tasks...</div>}

      {/* Kanban board */}
      {!loading && (
        <div className="kanban-board">
          {/* Column: Set */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'set')}
          >
            <h2>Task Set</h2>
            {getTasksByStatus('set').map(task => (
              <div 
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-header">
                  <h3>{task.task}</h3>
                  <button 
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(task.task);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p className="task-preview">{task.description.substring(0, 50)}...</p>
              </div>
            ))}
          </div>

          {/* Column: In Progress */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'process')}
          >
            <h2>In Progress</h2>
            {getTasksByStatus('process').map(task => (
              <div 
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-header">
                  <h3>{task.task}</h3>
                  <button 
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(task.task);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p className="task-preview">{task.description.substring(0, 50)}...</p>
              </div>
            ))}
          </div>

          {/* Column: Done */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            <h2>Done</h2>
            {getTasksByStatus('done').map(task => (
              <div 
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => setSelectedTask(task)}
              >
                <div className="task-header">
                  <h3>{task.task}</h3>
                  <button 
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(task.task);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <p className="task-preview">{task.description.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add task button */}
      <button 
        className="add-task-btn"
        onClick={() => setShowTaskForm(true)}
      >
        + Add Task
      </button>

      {/* Task form modal */}
      {showTaskForm && (
        <div className="modal-overlay">
          <div className="task-form-modal">
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Name:</label>
                <input
                  type="text"
                  name="task"
                  value={newTask.task}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                >
                  <option value="set">Task Set</option>
                  <option value="process">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit">Add Task</button>
                <button 
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task details modal */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="task-details-modal">
            <div className="task-details-header">
              <h2>{selectedTask.task}</h2>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(selectedTask.task)}
              >
                Copy Title
              </button>
            </div>
            <div className="task-details-body">
              <div className="task-description">
                <h3>Description:</h3>
                <p>{selectedTask.description}</p>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(selectedTask.description)}
                >
                  Copy Description
                </button>
              </div>
              <div className="task-status">
                <h3>Status:</h3>
                <p>{selectedTask.status === 'set' ? 'Task Set' : 
                    selectedTask.status === 'process' ? 'In Progress' : 'Done'}</p>
              </div>
            </div>
            <div className="task-details-actions">
              <button
                className="delete-btn"
                onClick={() => handleDeleteTask(selectedTask.id)}
              >
                Delete Task
              </button>
              <button
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;