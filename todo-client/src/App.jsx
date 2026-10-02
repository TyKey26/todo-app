import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await axios.post(API_URL, { title: newTitle, completed: false });
    setNewTitle('');
    fetchTodos();
  };

  const toggleTodo = async (todo) => {
    await axios.put(`${API_URL}/${todo.id}`, {
      ...todo,
      completed: !todo.completed,
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTodos();
  };

  // ✅ Удаление всех выполненных задач одним запросом
  const clearCompleted = async () => {
    if (!window.confirm('Удалить все выполненные задачи?')) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/completed`);
      console.log(`Удалено задач: ${res.data.deleted}`);
      await fetchTodos();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить выполненные задачи');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация
  const visibleTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Статистика
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const active = total - done;

  return (
    <div className="app">
      <h1>📝 ToDo List (React + PostgreSQL)</h1>

      <form onSubmit={addTodo} className="add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Что нужно сделать?"
        />
        <button type="submit">Добавить</button>
      </form>

      {/* Вкладки-фильтры */}
      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Активные
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Выполненные
        </button>
      </div>

      <ul className="todo-list">
        {visibleTodos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span className="title">{todo.title}</span>
            <button
              className="delete"
              onClick={() => deleteTodo(todo.id)}
              title="Удалить"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {visibleTodos.length === 0 && (
        <p className="empty">
          {filter === 'all' && 'Список пуст 🎉'}
          {filter === 'active' && 'Нет активных задач 👍'}
          {filter === 'completed' && 'Нет выполненных задач'}
        </p>
      )}

      {/* Футер со статистикой */}
      {total > 0 && (
        <div className="footer">
          <span className="stats">
            Всего: {total} · Активных: {active} · Выполнено: {done}
          </span>
          {done > 0 && (
            <button
              className="clear-btn"
              onClick={clearCompleted}
              disabled={loading}
            >
              {loading ? 'Удаление...' : 'Удалить выполненные'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;