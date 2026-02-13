import { useState } from 'react';
import axios from 'axios';
import styles from './ApiDemo.module.css';

export function ApiDemo() {
  const [helloMessage, setHelloMessage] = useState<string>('');
  const [greetMessage, setGreetMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleHello = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/hello`);
      setHelloMessage(response.data);
    } catch (err: any) {
      setError(`调用失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGreet = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/greet`, {
        params: { name: name || 'Guest' },
      });
      setGreetMessage(response.data.message);
    } catch (err: any) {
      setError(`调用失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>API 调用示例</h1>

      <div className={styles.section}>
        <h2>简单问候</h2>
        <button
          onClick={handleHello}
          disabled={loading}
          className={styles.button}
        >
          调用 /api/hello
        </button>
        {helloMessage && (
          <div className={styles.result}>
            <strong>响应:</strong> {helloMessage}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>个性化问候</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入你的名字"
            className={styles.input}
          />
          <button
            onClick={handleGreet}
            disabled={loading}
            className={styles.button}
          >
            调用 /api/greet
          </button>
        </div>
        {greetMessage && (
          <div className={styles.result}>
            <strong>响应:</strong> {greetMessage}
          </div>
        )}
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}

      {loading && <div className={styles.loading}>加载中...</div>}
    </div>
  );
}

export default ApiDemo;
