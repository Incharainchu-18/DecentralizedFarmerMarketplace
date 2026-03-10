// src/components/FarmerProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./FarmerProfile.css";

export default function FarmerProfile() {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const certInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with empty data
  const [form, setForm] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    yearsOfExperience: "",
    
    // Farm Information
    farmName: "",
    farmType: "",
    address: "",
    totalArea: "",
    cultivatedArea: "",
    soilType: "",
    irrigationType: "",
    organicCertified: false,
    
    // Crop Information
    crops: [{
      name: "",
      area: "",
      season: "",
      yield: ""
    }],
    
    // Additional profile information
    livestock: [{
      type: "",
      count: "",
      purpose: ""
    }],
    
    equipment: [""],
    storageCapacity: "",
    
    marketingChannels: [""],
    annualIncome: "",
    bankAccount: "",
    ifscCode: "",
    
    achievements: [""],
    certifications: [], // File[]
    avatarFile: null,
    
    cooperativeMember: false,
    cooperativeName: "",
    trainingCompleted: [""]
  });

  // Farm types and common options
  const farmTypes = [
    "Crop Farming",
    "Livestock Farming", 
    "Mixed Farming",
    "Organic Farming",
    "Horticulture",
    "Floriculture",
    "Aquaculture",
    "Vermiculture",
    "Other"
  ];

  const soilTypes = [
    "Alluvial",
    "Black",
    "Red",
    "Laterite", 
    "Mountainous",
    "Desert",
    "Other"
  ];

  const irrigationTypes = [
    "Well/Tube Well",
    "Canal",
    "River",
    "Rain-fed",
    "Drip Irrigation",
    "Sprinkler System",
    "Mixed"
  ];

  const livestockTypes = [
    "Dairy Cattle",
    "Beef Cattle",
    "Poultry",
    "Sheep",
    "Goats",
    "Pigs",
    "Fish",
    "Bees",
    "Other"
  ];

  const seasons = ["Kharif", "Rabi", "Zaid", "All Season"];

  useEffect(() => {
    loadFarmerData();
  }, []);

    const loadFarmerData = () => {
    try {
      console.log("🔍 Loading farmer data...");
      
      // First, check if we have a direct farmer profile
      const farmerProfile = localStorage.getItem("farmerProfile");
      const farmerRegistration = localStorage.getItem("farmerRegistration");
      
      if (farmerProfile) {
        console.log("✅ Loading from farmerProfile");
        const profileData = JSON.parse(farmerProfile);
        setForm(prev => ({
          ...prev,
          ...profileData,
          // Ensure we have the avatar data if it exists
          avatarDataUrl: profileData.avatarDataUrl || null
        }));
        
        if (profileData.avatarDataUrl) {
          setAvatarPreview(profileData.avatarDataUrl);
        }
        
        setSuccessMsg("Your farmer profile loaded successfully!");
        return;
      }
      
      if (farmerRegistration) {
        console.log("✅ Loading from farmerRegistration");
        const registrationData = JSON.parse(farmerRegistration);
        setForm(prev => ({
          ...prev,
          ...registrationData
        }));
        setSuccessMsg("Your registration data loaded successfully!");
        return;
      }
      
      // If no farmer-specific data, check general user data
      const userProfile = localStorage.getItem('userProfile');
      const userData = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      
      if (userProfile || userData) {
        console.log("🔄 Creating farmer profile from user data");
        const profile = userProfile ? JSON.parse(userProfile) : {};
        const user = userData ? JSON.parse(userData) : {};
        
        // Create a basic farmer profile from user data
        const basicFarmerProfile = {
          name: profile.name || user.name || "Farmer",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          farmName: profile.farmName || "My Farm",
          farmAddress: profile.address || "",
          // Set default values for other required fields
          farmType: "",
          totalArea: "",
          cultivatedArea: "",
          soilType: "",
          irrigationType: "",
          organicCertified: false,
          crops: [{ name: "", area: "", season: "", yield: "" }],
          livestock: [{ type: "", count: "", purpose: "" }],
          equipment: [""],
          marketingChannels: [""],
          achievements: [""],
          trainingCompleted: [""],
          cooperativeMember: false,
          cooperativeName: "",
          storageCapacity: "",
          annualIncome: "",
          bankAccount: "",
          ifscCode: ""
        };
        
        setForm(basicFarmerProfile);
        setSuccessMsg("Welcome! Please complete your farmer profile details.");
        
        // Auto-save this basic profile
        localStorage.setItem('farmerProfile', JSON.stringify(basicFarmerProfile));
        
      } else {
        console.log("❌ No user data found");
        setErrorMsg("No farmer data found. Please complete your registration first.");
      }

    } catch (error) {
      console.error("Error loading farmer data:", error);
      setErrorMsg("Error loading your farmer data. Please try again.");
    }
  };
  const validate = () => {
    // Required fields validation
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) 
      return "Please enter a valid email.";
    if (!form.phone.trim() || !/^\+?\d{7,15}$/.test(form.phone.replace(/\s+/g, ""))) 
      return "Please enter a valid phone number.";
    if (!form.farmName.trim()) return "Please enter your farm name.";
    if (!form.address.trim()) return "Please enter your farm address.";
    if (!form.totalArea) return "Please enter total farm area.";
    
    // Bank details validation if provided
    if (form.bankAccount && !/^\d{9,18}$/.test(form.bankAccount.replace(/\s+/g, "")))
      return "Please enter a valid bank account number.";
    if (form.bankAccount && !form.ifscCode.trim())
      return "Please enter IFSC code for bank account.";
    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode))
      return "Please enter a valid IFSC code.";

    return null;
  };

  const handleChange = (key) => (e) => {
    if (!isEditing) return;
    
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (section, index, field) => (e) => {
    if (!isEditing) return;
    
    const value = e.target.value;
    setForm(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section, defaultValue = "") => {
    if (!isEditing) return;
    
    setForm(prev => ({ 
      ...prev, 
      [section]: [...prev[section], defaultValue] 
    }));
  };

  const removeArrayItem = (section, index) => {
    if (!isEditing) return;
    
    setForm(prev => ({ 
      ...prev, 
      [section]: prev[section].filter((_, i) => i !== index) 
    }));
  };

  const addCrop = () => {
    if (!isEditing) return;
    
    setForm(prev => ({
      ...prev,
      crops: [...prev.crops, { name: "", area: "", season: "", yield: "" }]
    }));
  };

  const removeCrop = (index) => {
    if (!isEditing) return;
    
    setForm(prev => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index)
    }));
  };

  const addLivestock = () => {
    if (!isEditing) return;
    
    setForm(prev => ({
      ...prev,
      livestock: [...prev.livestock, { type: "", count: "", purpose: "" }]
    }));
  };

  const removeLivestock = (index) => {
    if (!isEditing) return;
    
    setForm(prev => ({
      ...prev,
      livestock: prev.livestock.filter((_, i) => i !== index)
    }));
  };

  const onAvatarSelected = (e) => {
    if (!isEditing) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Avatar must be an image file (JPEG, PNG, etc.).");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Avatar image must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setForm(prev => ({ ...prev, avatarFile: file }));
    setErrorMsg("");
  };

  const onCertsSelected = (e) => {
    if (!isEditing) return;
    
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrorMsg("Some files were skipped. Only PDF and image files under 10MB are allowed.");
    }

    setForm(prev => ({ 
      ...prev, 
      certifications: [...prev.certifications, ...validFiles] 
    }));
  };

  const removeCertificate = (index) => {
    if (!isEditing) return;
    
    setForm(prev => ({ 
      ...prev, 
      certifications: prev.certifications.filter((_, i) => i !== index) 
    }));
  };

  const clearMessages = () => { 
    setErrorMsg(""); 
    setSuccessMsg(""); 
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reload original data
      loadFarmerData();
    }
    setIsEditing(!isEditing);
    clearMessages();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    clearMessages();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setLoading(true);
    try {
      // Prepare data for storage (without File objects)
      const profileToSave = {
        ...form,
        // Remove File objects as they can't be stored in localStorage
        certifications: form.certifications.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified
        })),
        avatarDataUrl: avatarPreview || null,
        lastUpdated: new Date().toISOString()
      };
      
      // Remove the actual File objects before saving
      delete profileToSave.avatarFile;
      
      // Save farmer profile
      localStorage.setItem("farmerProfile", JSON.stringify(profileToSave));

      setSuccessMsg("Farmer profile updated successfully!");
      setIsEditing(false);

    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if farmer has any data loaded
  const hasFarmerData = () => {
    return form.name || form.email || form.phone || form.farmName;
  };

  const handleCompleteRegistration = () => {
    navigate('/farmer-registration');
  };

  return (
    <div className="farmer-profile-page" aria-live="polite">
      <div style={{ maxWidth: 1000, margin: "1.5rem auto", padding: 16 }}>
        <div className="profile-header">
          <h2>Farmer Profile</h2>
          <p className="muted">
            {hasFarmerData() ? 
              "Manage your complete farmer profile information" : 
              "Complete your farmer registration to create your profile"
            }
          </p>
          
          {!hasFarmerData() && (
            <div className="registration-alert">
              <div className="alert warning">
                <strong>No Farmer Data Found:</strong> Please complete your farmer registration first.
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleCompleteRegistration}
                type="button"
              >
                Complete Registration
              </button>
            </div>
          )}
        </div>

        {hasFarmerData() && (
          <form onSubmit={handleSubmit} className="farmer-profile-form" aria-label="Farmer profile form">
            {/* Profile Header with Edit Toggle */}
            <div className="profile-actions">
              <div className="profile-status">
                <span className={`status-badge ${isEditing ? 'editing' : 'viewing'}`}>
                  {isEditing ? 'Editing Mode' : 'Viewing Mode'}
                </span>
              </div>
              <div className="action-buttons">
                {!isEditing ? (
                  <button type="button" className="btn btn-primary" onClick={handleEditToggle}>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={handleEditToggle}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Personal Information Section */}
            <section className="form-section" aria-labelledby="personal-info">
              <h3 id="personal-info">Personal Information</h3>
              <div className="section-content">
                <div className="avatar-section">
                  <div className="logo-wrap avatar-preview">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile preview" />
                    ) : (
                      <div className="avatar-placeholder">👩‍🌾</div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="avatar-actions">
                      <button type="button" className="btn" onClick={() => avatarInputRef.current?.click()}>
                        Upload Photo
                      </button>
                      <input 
                        ref={avatarInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={onAvatarSelected} 
                        style={{ display: "none" }} 
                      />
                      <button 
                        type="button" 
                        className="btn" 
                        onClick={() => { 
                          setAvatarPreview(null); 
                          setForm(prev => ({ ...prev, avatarFile: null })); 
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="fields-grid">
                  <div className="field">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      id="name" 
                      required 
                      value={form.name} 
                      onChange={handleChange("name")} 
                      placeholder="Enter your full name" 
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      id="email" 
                      type="email" 
                      required 
                      value={form.email} 
                      onChange={handleChange("email")} 
                      placeholder="you@example.com" 
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                      id="phone" 
                      required 
                      value={form.phone} 
                      onChange={handleChange("phone")} 
                      placeholder="+91 98765 43210" 
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input 
                      id="dateOfBirth" 
                      type="date" 
                      value={form.dateOfBirth} 
                      onChange={handleChange("dateOfBirth")} 
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="gender">Gender</label>
                    <select 
                      id="gender" 
                      value={form.gender} 
                      onChange={handleChange("gender")} 
                      disabled={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="yearsOfExperience">Years of Farming Experience</label>
                    <input 
                      id="yearsOfExperience" 
                      type="number" 
                      value={form.yearsOfExperience} 
                      onChange={handleChange("yearsOfExperience")} 
                      placeholder="e.g., 10" 
                      min="0" 
                      readOnly={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Farm Information Section */}
            <section className="form-section" aria-labelledby="farm-info">
              <h3 id="farm-info">Farm Information</h3>
              <div className="fields-grid">
                <div className="field">
                  <label htmlFor="farmName">Farm Name *</label>
                  <input 
                    id="farmName" 
                    required 
                    value={form.farmName} 
                    onChange={handleChange("farmName")} 
                    placeholder="Enter your farm name" 
                    readOnly={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  />
                </div>

                <div className="field">
                  <label htmlFor="farmType">Farm Type</label>
                  <select 
                    id="farmType" 
                    value={form.farmType} 
                    onChange={handleChange("farmType")} 
                    disabled={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  >
                    <option value="">Select farm type</option>
                    {farmTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="field full-width">
                  <label htmlFor="address">Farm Address *</label>
                  <textarea 
                    id="address" 
                    required 
                    value={form.address} 
                    onChange={handleChange("address")} 
                    placeholder="Full address with landmark" 
                    rows={3} 
                    readOnly={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  />
                </div>

                <div className="field">
                  <label htmlFor="totalArea">Total Land Area (acres) *</label>
                  <input 
                    id="totalArea" 
                    type="number" 
                    required 
                    value={form.totalArea} 
                    onChange={handleChange("totalArea")} 
                    placeholder="e.g., 10" 
                    step="0.1" 
                    min="0" 
                    readOnly={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  />
                </div>

                <div className="field">
                  <label htmlFor="cultivatedArea">Cultivated Area (acres)</label>
                  <input 
                    id="cultivatedArea" 
                    type="number" 
                    value={form.cultivatedArea} 
                    onChange={handleChange("cultivatedArea")} 
                    placeholder="e.g., 8" 
                    step="0.1" 
                    min="0" 
                    readOnly={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  />
                </div>

                <div className="field">
                  <label htmlFor="soilType">Soil Type</label>
                  <select 
                    id="soilType" 
                    value={form.soilType} 
                    onChange={handleChange("soilType")} 
                    disabled={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="irrigationType">Irrigation Type</label>
                  <select 
                    id="irrigationType" 
                    value={form.irrigationType} 
                    onChange={handleChange("irrigationType")} 
                    disabled={!isEditing}
                    className={!isEditing ? "read-only" : ""}
                  >
                    <option value="">Select irrigation type</option>
                    {irrigationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="field checkbox-field">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={form.organicCertified} 
                      onChange={handleChange("organicCertified")} 
                      disabled={!isEditing}
                      className={!isEditing ? "read-only" : ""}
                    />
                    Organically Certified
                  </label>
                </div>
              </div>
            </section>

            {/* Crop Information Section */}
            <section className="form-section" aria-labelledby="crop-info">
              <h3 id="crop-info">Crop Information</h3>
              <div className="section-content">
                {form.crops.map((crop, index) => (
                  <div key={index} className="array-item">
                    <div className="fields-grid">
                      <div className="field">
                        <label>Crop Name</label>
                        <input
                          value={crop.name}
                          onChange={handleNestedChange("crops", index, "name")}
                          placeholder="e.g., Wheat, Rice, etc."
                          readOnly={!isEditing}
                          className={!isEditing ? "read-only" : ""}
                        />
                      </div>
                      <div className="field">
                        <label>Area (acres)</label>
                        <input
                          type="number"
                          value={crop.area}
                          onChange={handleNestedChange("crops", index, "area")}
                          placeholder="Area"
                          step="0.1"
                          min="0"
                          readOnly={!isEditing}
                          className={!isEditing ? "read-only" : ""}
                        />
                      </div>
                      <div className="field">
                        <label>Season</label>
                        <select
                          value={crop.season}
                          onChange={handleNestedChange("crops", index, "season")}
                          disabled={!isEditing}
                          className={!isEditing ? "read-only" : ""}
                        >
                          <option value="">Select season</option>
                          {seasons.map(season => (
                            <option key={season} value={season}>{season}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>Expected Yield (kg/acre)</label>
                        <input
                          type="number"
                          value={crop.yield}
                          onChange={handleNestedChange("crops", index, "yield")}
                          placeholder="Expected yield"
                          step="0.1"
                          min="0"
                          readOnly={!isEditing}
                          className={!isEditing ? "read-only" : ""}
                        />
                      </div>
                    </div>
                    {isEditing && form.crops.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-remove"
                        onClick={() => removeCrop(index)}
                      >
                        Remove Crop
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button type="button" className="btn btn-add" onClick={addCrop}>
                    + Add Another Crop
                  </button>
                )}
              </div>
            </section>

            {/* Alerts */}
            <div className="alerts-container">
              {errorMsg && <div className="alert error" role="alert">{errorMsg}</div>}
              {successMsg && <div className="alert success" role="status">{successMsg}</div>}
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="action-row">
                <button type="button" className="btn btn-secondary" onClick={handleEditToggle}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving Profile..." : "Save Farmer Profile"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}