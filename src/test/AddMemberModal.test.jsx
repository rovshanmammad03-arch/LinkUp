import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddMemberModal from '../components/messages/AddMemberModal';
import { DB } from '../services/db';

// Mock useScrollLock to avoid jsdom issues
vi.mock('../hooks/useScrollLock', () => ({ useScrollLock: () => {} }));

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
    Icon: ({ icon }) => <span data-testid={`icon-${icon}`} />,
}));

const mockUsers = [
    { id: 'u1', name: 'Ayxan Quliyev', field: 'Proqramlaşdırma', grad: 'from-brand-500 to-brand-600' },
    { id: 'u2', name: 'Leyla Məmmədova', field: 'Dizayn', grad: 'from-pink-500 to-rose-500' },
    { id: 'u3', name: 'Rəşad Əliyev', field: 'Proqramlaşdırma', grad: 'from-blue-500 to-indigo-600' },
];

beforeEach(() => {
    localStorage.clear();
    DB.set('users', mockUsers);
});

describe('AddMemberModal — unit testlər', () => {
    const defaultProps = {
        projectId: 'p1',
        currentMembers: [],
        adminId: 'admin1',
        onAdd: vi.fn(),
        onClose: vi.fn(),
        error: '',
        onClearError: vi.fn(),
    };

    it('axtarış sahəsi mövcuddur', () => {
        render(<AddMemberModal {...defaultProps} />);
        expect(screen.getByPlaceholderText('İstifadəçi axtar...')).toBeInTheDocument();
    });

    it('bütün namizədlər göstərilir (admin çıxarılmış)', () => {
        render(<AddMemberModal {...defaultProps} adminId="u1" />);
        // u1 admin olduğu üçün görünməməlidir
        expect(screen.queryByText('Ayxan Quliyev')).not.toBeInTheDocument();
        expect(screen.getByText('Leyla Məmmədova')).toBeInTheDocument();
        expect(screen.getByText('Rəşad Əliyev')).toBeInTheDocument();
    });

    it('aktiv üzv namizəd siyahısında görünmür', () => {
        const currentMembers = [{ id: 'u2', status: 'accepted' }];
        render(<AddMemberModal {...defaultProps} currentMembers={currentMembers} />);
        expect(screen.queryByText('Leyla Məmmədova')).not.toBeInTheDocument();
        expect(screen.getByText('Ayxan Quliyev')).toBeInTheDocument();
    });

    it('axtarış sahəsinə mətn daxil etdikdə nəticələr filtrlənir', () => {
        render(<AddMemberModal {...defaultProps} />);
        const input = screen.getByPlaceholderText('İstifadəçi axtar...');
        fireEvent.change(input, { target: { value: 'Leyla' } });
        expect(screen.getByText('Leyla Məmmədova')).toBeInTheDocument();
        expect(screen.queryByText('Ayxan Quliyev')).not.toBeInTheDocument();
    });

    it('boş axtarış nəticəsində "İstifadəçi tapılmadı" mesajı göstərilir', () => {
        render(<AddMemberModal {...defaultProps} />);
        const input = screen.getByPlaceholderText('İstifadəçi axtar...');
        fireEvent.change(input, { target: { value: 'xxxxxxxxxxx' } });
        expect(screen.getByText('İstifadəçi tapılmadı')).toBeInTheDocument();
    });

    it('"Ləğv et" düyməsi onClose-u çağırır', () => {
        const onClose = vi.fn();
        render(<AddMemberModal {...defaultProps} onClose={onClose} />);
        fireEvent.click(screen.getByText('Ləğv et'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('modal xaricinə klik etdikdə onClose çağırılır', () => {
        const onClose = vi.fn();
        render(<AddMemberModal {...defaultProps} onClose={onClose} />);
        // backdrop div — first child of the fixed container
        const backdrop = document.querySelector('.absolute.inset-0');
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('istifadəçiyə klik etdikdə onAdd doğru userId ilə çağırılır', () => {
        const onAdd = vi.fn();
        render(<AddMemberModal {...defaultProps} onAdd={onAdd} />);
        fireEvent.click(screen.getByText('Ayxan Quliyev'));
        expect(onAdd).toHaveBeenCalledWith('u1');
    });

    it('xəta mesajı göstərilir', () => {
        render(<AddMemberModal {...defaultProps} error="Bu istifadəçi artıq qrupun üzvüdür." />);
        expect(screen.getByText('Bu istifadəçi artıq qrupun üzvüdür.')).toBeInTheDocument();
    });
});
