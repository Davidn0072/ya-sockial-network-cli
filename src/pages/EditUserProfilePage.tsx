import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import styles from './EditUserProfilePage.module.css';

const SUGGESTIONS = ['Sports', 'Soccer', 'Basketball', 'Music', 'Technology', 'Cinema', 'Cooking', 'Dogs', 'Cats', 'Travel', 'Literature', 'Photography', 'Gaming', 'Art', 'Science'];

interface FormData {
  name: string;
  email: string;
  domainofinterest: string[];
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface OriginalValues {
  name: string;
  email: string;
  domainofinterest: string[];
}

export function EditUserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    domainofinterest: [],
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [originalValues, setOriginalValues] = useState<OriginalValues>({
    name: '',
    email: '',
    domainofinterest: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      navigate('/');
      return;
    }
    loadUserProfile();
  }, [user?.id, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile(user!.id);
      const newFormData: FormData = {
        name: profile.name || '',
        email: profile.email || '',
        domainofinterest: Array.isArray(profile.domainofinterest) ? profile.domainofinterest : [],
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      setFormData(newFormData);
      setOriginalValues({
        name: profile.name || '',
        email: profile.email || '',
        domainofinterest: Array.isArray(profile.domainofinterest) ? profile.domainofinterest : [],
      });
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Failed to load profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !formData.domainofinterest.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        domainofinterest: [...prev.domainofinterest, trimmed]
      }));
    }
  };

  const handleRemoveInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      domainofinterest: prev.domainofinterest.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const getAvailableSuggestions = () => {
    return SUGGESTIONS.filter(s => !formData.domainofinterest.includes(s));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setSaving(true);
    setStatus(null);

    try {
      const updateData: any = {};

      if (formData.name !== originalValues.name) {
        updateData.name = formData.name;
      }

      if (formData.email !== originalValues.email) {
        updateData.email = formData.email;
      }

      const interestsChanged =
        formData.domainofinterest.length !== originalValues.domainofinterest.length ||
        formData.domainofinterest.some((tag, i) => tag !== originalValues.domainofinterest[i]);

      if (interestsChanged) {
        updateData.domainofinterest = formData.domainofinterest;
      }

      if (showPasswordFields) {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
          setStatus({ message: 'All password fields are required', type: 'error' });
          setSaving(false);
          return;
        }
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setStatus({ message: 'No changes to save', type: 'error' });
        setSaving(false);
        return;
      }

      await userService.updateUserProfile(user.id, updateData);
      setStatus({ message: 'Profile updated successfully 🚀', type: 'success' });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'Failed to save profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button
          onClick={() => navigate('/')}
          className={styles.backButton}
        >
          ← Back
        </button>

        <h2>Edit Profile</h2>

        {status && (
          <div className={`${styles.status} ${styles[status.type]}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
            />
          </div>

          <div className={styles.sectionTitle}>Password</div>

          <label className={styles.pwdToggle}>
            <input
              type="checkbox"
              checked={showPasswordFields}
              onChange={(e) => setShowPasswordFields(e.target.checked)}
            />
            Change Password
          </label>

          {showPasswordFields && (
            <div className={styles.pwdFields}>
              <input
                type="password"
                placeholder="Old Password"
                value={formData.oldPassword || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  oldPassword: e.target.value
                }))}
              />
              <input
                type="password"
                placeholder="New Password"
                value={formData.newPassword || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
              />
            </div>
          )}

          <div className={styles.sectionTitle}>Interests</div>

          <div className={styles.tagsArea}>
            {formData.domainofinterest.map((tag, i) => (
              <span key={i} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(i)}
                  className={styles.tagRemoveBtn}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className={styles.tagInputRow}>
            <input
              type="text"
              id="interestInput"
              placeholder="Add Interest..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = (e.target as HTMLInputElement);
                  handleAddInterest(input.value);
                  input.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById('interestInput') as HTMLInputElement;
                if (input) {
                  handleAddInterest(input.value);
                  input.value = '';
                }
              }}
            >
              + Add
            </button>
          </div>

          <div className={styles.suggestions}>
            {getAvailableSuggestions().slice(0, 8).map(suggestion => (
              <button
                key={suggestion}
                type="button"
                className={styles.suggestion}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddInterest(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
