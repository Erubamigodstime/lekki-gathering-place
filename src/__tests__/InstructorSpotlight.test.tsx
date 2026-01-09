import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { InstructorSpotlight } from '../components/InstructorsSpotlight-new';

describe('InstructorSpotlight', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders the section heading', () => {
    renderWithRouter(<InstructorSpotlight />);
    expect(screen.getByText(/Meet Our/i)).toBeInTheDocument();
    expect(screen.getByText(/Expert Instructors/i)).toBeInTheDocument();
  });

  it('renders all instructors', () => {
    renderWithRouter(<InstructorSpotlight />);
    expect(screen.getByText('Francis Happy')).toBeInTheDocument();
    expect(screen.getByText('Amara Okonkwo')).toBeInTheDocument();
    expect(screen.getByText('Kingsley Ugwumba')).toBeInTheDocument();
  });

  it('displays instructor skills', () => {
    renderWithRouter(<InstructorSpotlight />);
    expect(screen.getByText('Designer & Software Engineer')).toBeInTheDocument();
  });

  it('shows View Profile buttons', () => {
    renderWithRouter(<InstructorSpotlight />);
    const buttons = screen.getAllByRole('button', { name: /View profile/i });
    expect(buttons).toHaveLength(4); // 4 instructors
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<InstructorSpotlight />);
    const section = screen.getByLabelText(/instructors/i);
    expect(section).toBeInTheDocument();
  });
});
