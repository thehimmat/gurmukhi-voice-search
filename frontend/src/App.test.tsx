import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Gurmukhi Voice Search/i);
    expect(headerElement).toBeInTheDocument();
  });
});
