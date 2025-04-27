import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5199/api/tasks',
});

export const addTask = async (taskData) => {
    try {
      const response = await instance.post('', taskData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при добавлении задачи', error);
      throw error;
    }
  };
  

export const getTasks = async (sortBy = '') => {
    try {
      const response = await instance.get('', {
        params: { sortBy },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении задач', error);
      throw error;
    }
  };
  

export const getTaskById = async (id) => {
  try {
    const response = await instance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении задачи', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await instance.delete(`/${taskId}`);
  } catch (error) {
    console.error('Ошибка при удалении задачи', error);
    throw error;
  }
};

export const updateTask = async (taskId, updatedData) => {
  try {
    const response = await instance.put(`/${taskId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении задачи', error);
    throw error;
  }
};

export const markTaskAsCompleted = async (taskId) => {
  try {
    const response = await instance.patch(`/${taskId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при маркировке задачи как выполненной', error);
    throw error;
  }
};

export const markTaskAsActive = async (taskId) => {
  try {
    const response = await instance.patch(`/${taskId}/active`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при маркировке задачи как активной', error);
    throw error;
  }
};
