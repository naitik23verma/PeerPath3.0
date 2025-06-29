import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    year: '',
    expertise: [],
    skills: [],
    doubtsSolved: 0,
    doubtsAsked: 0,
    joinDate: '',
    profilePhoto: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    setCurrentUser(user);
    fetchUserProfile(user._id);
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfileData({
        username: response.data.username || '',
        bio: response.data.bio || '',
        year: response.data.year || '',
        expertise: response.data.expertise || [],
        skills: response.data.skills || [],
        doubtsSolved: response.data.doubtsSolved || 0,
        doubtsAsked: response.data.doubtsAsked || 0,
        joinDate: new Date(response.data.joinDate).toLocaleDateString(),
        profilePhoto: response.data.profilePhoto || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/profile', 
        {
          bio: profileData.bio,
          year: profileData.year,
          expertise: profileData.expertise.join(','),
          skills: profileData.skills.join(',')
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profileData.expertise.includes(newExpertise.trim())) {
      setProfileData({
        ...profileData,
        expertise: [...profileData.expertise, newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertiseToRemove) => {
    setProfileData({
      ...profileData,
      expertise: profileData.expertise.filter(item => item !== expertiseToRemove)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const stats = [
    { label: 'Doubts Solved', value: profileData.doubtsSolved },
    { label: 'Doubts Asked', value: profileData.doubtsAsked },
    { label: 'Days Active', value: Math.ceil((Date.now() - new Date(profileData.joinDate)) / (1000 * 60 * 60 * 24)) }
  ];

  return (
    <div className="profile-container">
      <nav className="profile-nav">
        <div className="nav-logo">
          <img src="/peerpath.png" alt="PeerPath" />
          <h1>PeerPath</h1>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/collaboration">Collaboration</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/profile" className="active">Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" className="avatar-image" />
            ) : (
              <span className="avatar-text">{profileData.username.charAt(0)}</span>
            )}
          </div>
          <div className="profile-info">
            <h1>{profileData.username}</h1>
            <p className="profile-level">{profileData.year || 'Student'}</p>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h2>About Me</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="bio-input"
                rows="4"
              />
            ) : (
              <p className="bio-text">{profileData.bio || 'No bio added yet.'}</p>
            )}
          </div>

          <div className="profile-section">
            <h2>Skills</h2>
            <div className="skills-container">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  {isEditing && (
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="add-input"
                />
                <button onClick={addSkill} className="add-btn">Add</button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Areas of Expertise</h2>
            <div className="interests-container">
              {profileData.expertise.map((item, index) => (
                <span key={index} className="interest-tag">
                  {item}
                  {isEditing && (
                    <button 
                      onClick={() => removeExpertise(item)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Add an area of expertise"
                  className="add-input"
                />
                <button onClick={addExpertise} className="add-btn">Add</button>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Academic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Year of Study</label>
                {isEditing ? (
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                    className="info-input"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                ) : (
                  <span>{profileData.year || 'Not specified'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="save-section">
            <button onClick={handleSave} className="save-btn">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 