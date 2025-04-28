import React, { useEffect, useState, useRef } from 'react';
import {getTasks, addTask, deleteTask, markTaskAsCompleted, markTaskAsActive, getTaskById, updateTask,} from '../Api/TasksApi';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const viewModalRef = useRef();
  const editModalRef = useRef();

  useEffect(() => {
    fetchTasks();
  }, [sortBy]);

  const fetchTasks = async () => {
    const tasksData = await getTasks(sortBy);
    setTasks(tasksData);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
  
    const cleanedTitle = title
      .replace(/!1|!2|!3|!4/gi, '')
      .replace(/!before\s*\d{2}[.-]\d{2}[.-]\d{4}/gi, '')
      .trim();
  
    if (cleanedTitle === '') {
      alert('Пожалуйста, введите название задачи (не только маркеры).');
      return;
    }
  
    const taskData = {
      title,
      description,
      priority: priority || null,
      deadline: deadline || null,
    };
  
    try {
      await addTask(taskData);
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('');
      fetchTasks();
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      alert('Произошла ошибка при создании задачи. Попробуйте ещё раз.');
    }
  };
  

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    fetchTasks();
  };

  const handleComplete = async (taskId) => {
    await markTaskAsCompleted(taskId);
    fetchTasks();
  };

  const handleReopen = async (taskId) => {
    await markTaskAsActive(taskId);
    fetchTasks();
  };

  const openViewModal = async (taskId) => {
    const task = await getTaskById(taskId);
    setSelectedTask(task);
    viewModalRef.current.showModal();
  };

  const openEditModal = async (taskId) => {
    const task = await getTaskById(taskId);
    setEditingTask(task);
    editModalRef.current.showModal();
  };

  const getTaskColorClass = (task) => {
    if (task.status === 'Completed') {
      return 'task-completed';
    }
  
    if (!task.deadline) {
      return 'task-no-deadline';
    }
  
    const now = new Date();
    const deadline = new Date(task.deadline);
  
    const diffInMs = deadline - now;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
    if (diffInMs < 0) {
      return 'task-deadline-overdue';
    }
  
    if (diffInDays <= 3) {
      return 'task-deadline-soon';
    }
  
    return 'task-default';
  };
  

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="task-list-container">
      <h2>Задачи</h2>

      <form onSubmit={handleAddTask} className="add-task-form">
        <h3>Добавить новую задачу</h3>
        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Выберите приоритет</option>
          <option value="Low">Низкий</option>
          <option value="Medium">Средний</option>
          <option value="High">Высокий</option>
          <option value="Critical">Критический</option>
        </select>
        <button type="submit">Создать задачу</button>
      </form>

      <div className="sort-container">
        <label>Сортировать по: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Без сортировки</option>
          <option value="status-active">По статусу (сначала Active)</option>
          <option value="status-late">По статусу (сначала Late)</option>
          <option value="priority-low">По приоритету (по возрастанию)</option>
          <option value="priority-high">По приоритету (по убыванию)</option>
          <option value="deadline-asc">По дедлайну (по возрастанию)</option>
          <option value="deadline-desc">По дедлайну (по убыванию)</option>
          <option value="created-oldest">По дате создания (сначала старые)</option>
          <option value="created-newest">По дате создания (сначала новые)</option>
        </select>
      </div>

      <ul className="task-list">
  {tasks.map((task) => (
    <li
      key={task.id}
      className={`task-item ${getTaskColorClass(task)}`}
    >

            <div onClick={() => openViewModal(task.id)} className="task-title">
              <strong>{task.title}</strong> — {task.priority} — {task.status}
            </div>
            <div className="task-actions">
              <button onClick={() => handleDelete(task.id)} className="delete-btn">Удалить</button>
              {task.status === 'Active' ? (
                <button onClick={() => handleComplete(task.id)} className="complete-btn">Завершить</button>
              ) : (
                <button onClick={() => handleReopen(task.id)} className="reopen-btn">Вернуть</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* View Modal */}
      <dialog ref={viewModalRef} className="modal view-modal">
  {selectedTask && (
    <div>
      <div className="modal-header">
        <h3>{selectedTask.title}</h3>
        <div className="modal-header-buttons">
          <button className="edit-btn" onClick={() => openEditModal(selectedTask.id)}>
            Редактировать
          </button>
          <button className="close-btn" onClick={() => viewModalRef.current.close()} aria-label="Закрыть">
            ✖
          </button>
        </div>
      </div>

      {selectedTask.description && (
  <p><strong>Описание:</strong> {selectedTask.description}</p>
)}
{selectedTask.priority && (
  <p><strong>Приоритет:</strong> {selectedTask.priority}</p>
)}
{selectedTask.deadline && (
  <p><strong>Дедлайн:</strong> {formatDate(selectedTask.deadline)}</p>
)}
{selectedTask.status && (
  <p><strong>Статус:</strong> {selectedTask.status}</p>
)}
{selectedTask.createdAt && (
  <p><strong>Создана:</strong> {formatDate(selectedTask.createdAt)}</p>
)}
{selectedTask.updatedAt && (
  <p><strong>Обновлена:</strong> {formatDate(selectedTask.updatedAt)}</p>
)}


      <div className="modal-actions">
        <button className="delete-btn" onClick={async () => {
          await handleDelete(selectedTask.id);
          viewModalRef.current.close();
        }}>
          Удалить
        </button>
        {selectedTask.status === 'Active' ? (
          <button className="complete-btn" onClick={async () => {
            await handleComplete(selectedTask.id);
            await openViewModal(selectedTask.id);
          }}>
            Завершить
          </button>
        ) : (
          <button className="reopen-btn" onClick={async () => {
            await handleReopen(selectedTask.id);
            await openViewModal(selectedTask.id);
          }}>
            Вернуть
          </button>
        )}
      </div>
    </div>
  )}
</dialog>



      {/* Edit Modal */}
      <dialog ref={editModalRef} className="modal edit-modal">
  {editingTask && (
    <form
  onSubmit={async (e) => {
    e.preventDefault();

    const updatedTask = {
      title: editingTask.title?.trim() ?? '',
      description: editingTask.description ?? '',
      deadline: editingTask.deadline ? new Date(editingTask.deadline).toISOString() : null,

      priority: editingTask.priority ? editingTask.priority : null,
    };

    try {
      const updated = await updateTask(editingTask.id, updatedTask);
      editModalRef.current.close();
      setEditingTask(null);
      await fetchTasks();
      if (selectedTask && selectedTask.id === updated.id) {
        setSelectedTask(updated);
      }
      
      
    } catch (error) {
      console.error('Ошибка при обновлении задачи', error);
      alert('Ошибка при обновлении задачи. Проверьте заполненные поля.');
    }
  }}
  className="edit-form"
>

      <h3>Редактировать задачу</h3>

      <label>
        Название:
        <input
          type="text"
          value={editingTask.title}
          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
          className="input-field"
        />
      </label>

      <label>
        Описание:
        <textarea
          value={editingTask.description}
          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
          className="textarea-field"
        />
      </label>

      <label>
        Дедлайн:
        <input
          type="date"
          value={editingTask.deadline?.slice(0, 10)}
          onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
          className="input-field"
        />
      </label>

      <label>
        Приоритет:
        <select
          value={editingTask.priority}
          onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
          className="select-field"
        >
          <option value="Low">Низкий</option>
          <option value="Medium">Средний</option>
          <option value="High">Высокий</option>
          <option value="Critical">Критический</option>
        </select>
      </label>

      <div className="form-actions">
  <button type="submit" className="save-btn">Сохранить</button>
  <button type="button" onClick={() => editModalRef.current.close()} className="cancel-btn">
    Отмена
  </button>
</div>

    </form>
  )}
</dialog>


    </div>
  );
};

export default TaskList;
