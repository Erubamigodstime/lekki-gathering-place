import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import InstructorProfile from '../pages/instructors/InstructorProfile';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('InstructorProfile', () => {
  const renderWithRouter = (initialRoute: string) => {
    return render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/instructor/:id" element={<InstructorProfile />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('renders instructor profile for Francis Happy', () => {
    renderWithRouter('/instructor/francis-happy');
    expect(screen.getByText('Francis Happy')).toBeInTheDocument();
    expect(screen.getByText('Designer & Software Engineer')).toBeInTheDocument();
  });

  it('displays instructor experience and ward', () => {
    renderWithRouter('/instructor/francis-happy');
    expect(screen.getByText(/5 years Experience/i)).toBeInTheDocument();
    // Ward appears multiple times (header + other instructors), so check for at least one
    expect(screen.getAllByText(/Lekki Ward/i).length).toBeGreaterThan(0);
  });

  it('shows About section', () => {
    renderWithRouter('/instructor/francis-happy');
    // "About" appears in nav and as heading, query for the heading specifically
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  });

  it('displays specializations when available', () => {
    renderWithRouter('/instructor/francis-happy');
    expect(screen.getByText('Specializations')).toBeInTheDocument();
    expect(screen.getByText('Graphic Design')).toBeInTheDocument();
  });

  it('shows other instructors section', () => {
    renderWithRouter('/instructor/francis-happy');
    expect(screen.getByText(/Other/i)).toBeInTheDocument();
    expect(screen.getByText(/Instructors/i)).toBeInTheDocument();
    // Should show the other 3 instructors
    expect(screen.getByText('Amara Okonkwo')).toBeInTheDocument();
  });

  it('displays 404 message for unknown instructor', () => {
    renderWithRouter('/instructor/unknown-id');
    expect(screen.getByText('Instructor not found')).toBeInTheDocument();
  });

  it('has accessible main landmark', () => {
    renderWithRouter('/instructor/francis-happy');
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label', 'Instructor Profile');
  });
});
