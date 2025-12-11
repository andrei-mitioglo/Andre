import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut, Settings, Plus, Trash2, Edit, Users, Box, Shield, UserCog } from 'lucide-react';

// Базовый URL для API запросов
const BACKEND_URL = 'http://localhost:8000';

// --- Компоненты интерфейса ---

function NavigationBar({ currentUser, handleLogout, itemsInCart }) {
  return (
    <nav className="navigation-bar">
      <div className="wrapper nav-wrapper">
        <Link to="/" className="brand-logo">ЦифроМаркет</Link>
        <div className="menu-links">
          <Link to="/" className="menu-item">Каталог</Link>
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
            <Link to="/admin" className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} />
              <span>Панель управления</span>
            </Link>
          )}
          {currentUser ? (
            <>
              <Link to="/cart" className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} />
                <span>Корзина ({itemsInCart})</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} />
                <span>{currentUser.username}</span>
              </div>
              <button onClick={handleLogout} className="menu-item" style={{ background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="action-btn action-btn-main" style={{ width: 'auto', textDecoration: 'none' }}>Войти</Link>
              <Link to="/register" className="action-btn action-btn-alt" style={{ width: 'auto', textDecoration: 'none' }}>Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function CatalogPage({ handleAddToCart }) {
  const [catalogItems, setCatalogItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/products`)
      .then(response => response.json())
      .then(data => {
        setCatalogItems(data);
        setIsLoading(false);
      })
      .catch(error => console.error("Ошибка загрузки каталога:", error));
  }, []);

  if (isLoading) return <div className="wrapper" style={{ padding: '2rem' }}>Загружаем товары...</div>;

  return (
    <div className="wrapper">
      <h1 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Популярные товары</h1>
      <div className="catalog-grid">
        {catalogItems.map(item => (
          <div key={item.id} className="product-card">
            <div className="product-image">
              <Package size={64} />
            </div>
            <div className="product-info">
              <h3 className="product-title">{item.name}</h3>
              <p className="product-cost">${item.price}</p>
              <button onClick={() => handleAddToCart(item)} className="action-btn action-btn-main">
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthorizationPage({ handleAuth }) {
  const [loginValue, setLoginValue] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [authError, setAuthError] = useState('');

  const processAuth = async (evt) => {
    evt.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginValue, password: secretKey })
      });
      const result = await response.json();
      if (response.ok) {
        handleAuth(result);
      } else {
        setAuthError(result.detail || 'Ошибка авторизации');
      }
    } catch (err) {
      setAuthError('Сервер временно недоступен');
    }
  };

  return (
    <div className="wrapper" style={{ maxWidth: '400px', marginTop: '3rem' }}>
      <h2>Авторизация</h2>
      <form onSubmit={processAuth} className="auth-form">
        <input
          type="text"
          placeholder="Ваш логин"
          value={loginValue}
          onChange={(evt) => setLoginValue(evt.target.value)}
          className="text-field"
        />
        <input
          type="password"
          placeholder="Секретный ключ"
          value={secretKey}
          onChange={(evt) => setSecretKey(evt.target.value)}
          className="text-field"
        />
        {authError && <p style={{ color: 'var(--error-color)' }}>{authError}</p>}
        <button type="submit" className="action-btn action-btn-main">Войти в систему</button>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Нет аккаунта? <Link to="/register" style={{ color: 'var(--main-accent)' }}>Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}

function RegistrationPage({ handleAuth }) {
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const navigate = useNavigate();

  const processRegistration = async (evt) => {
    evt.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (newPassword !== confirmPassword) {
      setRegError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 4) {
      setRegError('Пароль должен быть не менее 4 символов');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newLogin, password: newPassword })
      });
      const result = await response.json();
      
      if (response.ok) {
        setRegSuccess('Аккаунт создан! Выполняем вход...');
        // Автоматический вход после регистрации
        const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newLogin, password: newPassword })
        });
        const loginResult = await loginResponse.json();
        if (loginResponse.ok) {
          handleAuth(loginResult);
          navigate('/');
        }
      } else {
        setRegError(result.detail || 'Ошибка регистрации');
      }
    } catch (err) {
      setRegError('Сервер временно недоступен');
    }
  };

  return (
    <div className="wrapper" style={{ maxWidth: '400px', marginTop: '3rem' }}>
      <h2>Регистрация</h2>
      <form onSubmit={processRegistration} className="auth-form">
        <input
          type="text"
          placeholder="Придумайте логин"
          value={newLogin}
          onChange={(evt) => setNewLogin(evt.target.value)}
          className="text-field"
          required
        />
        <input
          type="password"
          placeholder="Придумайте пароль"
          value={newPassword}
          onChange={(evt) => setNewPassword(evt.target.value)}
          className="text-field"
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(evt) => setConfirmPassword(evt.target.value)}
          className="text-field"
          required
        />
        {regError && <p style={{ color: 'var(--error-color)' }}>{regError}</p>}
        {regSuccess && <p style={{ color: 'var(--success-color)' }}>{regSuccess}</p>}
        <button type="submit" className="action-btn action-btn-main">Создать аккаунт</button>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--main-accent)' }}>Войти</Link>
        </p>
      </form>
    </div>
  );
}

function ShoppingCartPage({ cartContent, handleCheckout, clearCart }) {
  const totalSum = cartContent.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="wrapper" style={{ marginTop: '2rem' }}>
      <h2>Ваша корзина</h2>
      {cartContent.length === 0 ? (
        <p>Корзина пуста. Добавьте товары из каталога!</p>
      ) : (
        <>
          <div className="cart-items">
            {cartContent.map((item, idx) => (
              <div key={idx} className="cart-row">
                <span>{item.name}</span>
                <span>${item.price}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <strong>Итого: ${totalSum.toFixed(2)}</strong>
          </div>
          <button onClick={handleCheckout} className="action-btn action-btn-main" style={{ marginTop: '1rem' }}>
            Оформить заказ
          </button>
        </>
      )}
    </div>
  );
}

function AdminDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('products');
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [itemToEdit, setItemToEdit] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadInventory = () => {
    fetch(`${BACKEND_URL}/products`)
      .then(response => response.json())
      .then(data => setInventory(data));
  };

  const loadUsers = () => {
    fetch(`${BACKEND_URL}/admin/users`)
      .then(response => response.json())
      .then(data => setUsers(data));
  };

  useEffect(() => { 
    loadInventory(); 
    loadUsers();
  }, []);

  const addNewItem = async (evt) => {
    evt.preventDefault();
    await fetch(`${BACKEND_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItem.name, price: parseFloat(newItem.price) })
    });
    setNewItem({ name: '', price: '' });
    loadInventory();
    showStatus('Товар добавлен');
  };

  const modifyItem = async (evt) => {
    evt.preventDefault();
    await fetch(`${BACKEND_URL}/admin/products/${itemToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: itemToEdit.name, price: parseFloat(itemToEdit.price) })
    });
    setItemToEdit(null);
    loadInventory();
    showStatus('Товар обновлён');
  };

  const removeItem = async (itemId) => {
    if (!confirm('Удалить этот товар?')) return;
    await fetch(`${BACKEND_URL}/admin/products/${itemId}`, { method: 'DELETE' });
    loadInventory();
    showStatus('Товар удалён');
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        loadUsers();
        showStatus('Роль пользователя изменена');
      } else {
        const error = await response.json();
        showStatus(error.detail || 'Ошибка изменения роли', true);
      }
    } catch (err) {
      showStatus('Ошибка сервера', true);
    }
  };

  const removeUser = async (userId) => {
    if (!confirm('Удалить этого пользователя?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        loadUsers();
        showStatus('Пользователь удалён');
      } else {
        const error = await response.json();
        showStatus(error.detail || 'Ошибка удаления', true);
      }
    } catch (err) {
      showStatus('Ошибка сервера', true);
    }
  };

  const showStatus = (message, isError = false) => {
    setStatusMessage({ text: message, isError });
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: { bg: '#dc2626', label: 'Администратор' },
      moderator: { bg: '#f59e0b', label: 'Модератор' },
      user: { bg: '#3b82f6', label: 'Пользователь' }
    };
    const style = roleStyles[role] || roleStyles.user;
    return (
      <span style={{
        background: style.bg,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="wrapper" style={{ marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={28} /> {currentUser?.role === 'admin' ? 'Панель администратора' : 'Панель модератора'}
      </h2>
      
      {statusMessage && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem',
          background: statusMessage.isError ? 'var(--error-color)' : 'var(--success-color)',
          color: 'white'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`action-btn ${activeTab === 'products' ? 'action-btn-main' : 'action-btn-alt'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Box size={20} /> Товары
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`action-btn ${activeTab === 'users' ? 'action-btn-main' : 'action-btn-alt'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={20} /> Пользователи
          </button>
        )}
      </div>

      {/* Вкладка товаров */}
      {activeTab === 'products' && (
        <>
          <form onSubmit={addNewItem} className="admin-form">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> Добавить новый товар
            </h3>
            <input
              type="text"
              placeholder="Название товара"
              value={newItem.name}
              onChange={(evt) => setNewItem({ ...newItem, name: evt.target.value })}
              className="text-field"
              required
            />
            <input
              type="number"
              placeholder="Стоимость ($)"
              value={newItem.price}
              onChange={(evt) => setNewItem({ ...newItem, price: evt.target.value })}
              className="text-field"
              step="0.01"
              required
            />
            <button type="submit" className="action-btn action-btn-main">
              <Plus size={20} /> Добавить товар
            </button>
          </form>

          {itemToEdit && (
            <form onSubmit={modifyItem} className="admin-form" style={{ marginTop: '1rem', background: 'var(--highlight-bg)' }}>
              <h3>Редактирование товара</h3>
              <input
                type="text"
                value={itemToEdit.name}
                onChange={(evt) => setItemToEdit({ ...itemToEdit, name: evt.target.value })}
                className="text-field"
              />
              <input
                type="number"
                value={itemToEdit.price}
                onChange={(evt) => setItemToEdit({ ...itemToEdit, price: evt.target.value })}
                className="text-field"
                step="0.01"
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="action-btn action-btn-main">Сохранить</button>
                <button type="button" onClick={() => setItemToEdit(null)} className="action-btn action-btn-alt">Отменить</button>
              </div>
            </form>
          )}

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Каталог товаров ({inventory.length})</h3>
          <div className="inventory-list">
            {inventory.map(item => (
              <div key={item.id} className="inventory-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Package size={24} style={{ color: 'var(--main-accent)' }} />
                  <span><strong>{item.name}</strong> — ${item.price}</span>
                </div>
                <div>
                  <button onClick={() => setItemToEdit(item)} className="icon-button"><Edit size={18} /></button>
                  <button onClick={() => removeItem(item.id)} className="icon-button error-btn"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Вкладка пользователей (только для админов) */}
      {activeTab === 'users' && currentUser?.role === 'admin' && (
        <>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCog size={24} /> Управление пользователями ({users.length})
          </h3>
          
          <div className="inventory-list">
            {users.map(user => (
              <div key={user.id} className="inventory-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <User size={24} style={{ color: 'var(--secondary-accent)' }} />
                  <div>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {user.id}</div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    value={user.role}
                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                    className="text-field"
                    style={{ width: 'auto', marginBottom: 0, padding: '0.5rem' }}
                    disabled={user.id === currentUser?.user_id}
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Администратор</option>
                  </select>
                  <button 
                    onClick={() => removeUser(user.id)} 
                    className="icon-button error-btn"
                    disabled={user.id === currentUser?.user_id}
                    title={user.id === currentUser?.user_id ? 'Нельзя удалить себя' : 'Удалить пользователя'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-form" style={{ marginTop: '2rem' }}>
            <h4>Описание ролей:</h4>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.8' }}>
              <li><strong>Администратор</strong> — полный доступ к управлению товарами и пользователями</li>
              <li><strong>Модератор</strong> — может управлять товарами</li>
              <li><strong>Пользователь</strong> — может просматривать товары и делать покупки</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function MainApplication() {
  const [currentUser, setCurrentUser] = useState(null);
  const [shoppingCart, setShoppingCart] = useState([]);

  const handleAuth = (userData) => {
    setCurrentUser({ user_id: userData.user_id, username: userData.username, role: userData.role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShoppingCart([]);
  };

  const handleAddToCart = (item) => {
    setShoppingCart([...shoppingCart, item]);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Войдите в систему для оформления заказа');
      return;
    }
    await fetch(`${BACKEND_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.user_id,
        items: shoppingCart,
        total_amount: shoppingCart.reduce((sum, item) => sum + item.price, 0)
      })
    });
    alert('Заказ успешно оформлен!');
    setShoppingCart([]);
  };

  return (
    <Router>
      <NavigationBar currentUser={currentUser} handleLogout={handleLogout} itemsInCart={shoppingCart.length} />
      <Routes>
        <Route path="/" element={<CatalogPage handleAddToCart={handleAddToCart} />} />
        <Route path="/login" element={<AuthorizationPage handleAuth={handleAuth} />} />
        <Route path="/register" element={<RegistrationPage handleAuth={handleAuth} />} />
        <Route path="/cart" element={<ShoppingCartPage cartContent={shoppingCart} handleCheckout={handleCheckout} />} />
        <Route path="/admin" element={<AdminDashboard currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}

export default MainApplication;
