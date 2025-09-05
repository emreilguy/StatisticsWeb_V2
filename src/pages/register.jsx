import React, { useCallback, useState } from 'react';
import { Plus, MapPin, Users, Building2, Globe } from 'lucide-react';
import useBaseTables from '../hooks/useBaseTables';
import { WriteTable } from '../constants/AwsUtils';
import { v4 as uuidv4 } from 'uuid';
import useToast from '../hooks/useToast';
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const RegisterPage = () => {

    const [showPassword, setShowPassword] = useState(false);
    const { toast, showToast } = useToast();
    const [activeTab, setActiveTab] = useState('center');
    const { region, country, city, location } = useBaseTables();
    const [selectedRegionId, setSelectedRegionId] = useState(null);
    const [selectedCountryId, setSelectedCountryId] = useState(null);
    const [SelectedCityId, setSelectedCityId] = useState('');
    const [SelectedCenterId, setSelectedCenterId] = useState('');

    // Center Registration State
    const [centerData, setCenterData] = useState({
        projectCode: '',
        centerName: '',
        centerId: ''

    });
    // User Registration State
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        authority: '',
        phone: '',
    });

    const center = location?.map(item => ({
        name: item.name,
        project_code: item.project_code ? item.project_code : "Empty",
        centerId: item.id

    }));
    const continents = region?.map(item => ({
        name: item.name,
        id: item.id
    }));
    const countries = country?.map(item => ({
        name: item.name,
        id: item.id,
        region_id: item.region_id,
    }))
    const cities = city?.map(item => ({
        name: item.name,
        id: item.id,
        country_id: item.country_id,

    }))

    const matchedCountries = selectedRegionId ? countries.filter((item) => String(item.region_id) === String(selectedRegionId)).sort((a, b) => a.name.localeCompare(b.name)) : [];
    const matchedCities = selectedCountryId ? cities.filter((item) => String(item.country_id) === String(selectedCountryId)).sort((a, b) => a.name.localeCompare(b.name)) : [];







    const authorities = ['Admin', 'User'];
    const centerNames = ['DOF Robotics Main', 'DOF Tech Center', 'DOF Innovation Lab', 'DOF Service Hub'];

    const handleCenterSubmit = useCallback(() => {
        if (
            !SelectedCityId ||
            !centerData.centerName.trim()
        ) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        const items = {
            id: uuidv4(),
            city_id: SelectedCityId,
            name: centerData.centerName,
            project_code: centerData.projectCode,
            visible: "True"
        };

        WriteTable("db_centers", items);

        showToast("Center Added Successfully", "success");


        setCenterData({ projectCode: '', centerName: '' });
        setSelectedRegionId(null);
        setSelectedCountryId(null);
        setSelectedCityId('');
    }, [SelectedCityId, centerData.centerName, centerData.projectCode, showToast]);


    const handleUserSubmit = useCallback(() => {
        if ((!userData.name.trim() || !userData.email.trim() || !userData.password.trim()) || !userData.authority.trim()) {
            console.log(userData.authority, "-----")



            showToast("Please fill in all required fields", "error");
            return;
        }
        if (userData.authority === "User" && !SelectedCenterId) {
            console.log("y")
            showToast("Please fill in all required fields", "error");
            return;

        }
        if (userData.authority === "Admin") {
            console.log("x")
            showToast("Please fill in all required fields", "error");
            // az kaldı
        }

        const userItem = {
            id: uuidv4(),
            center_id: SelectedCenterId,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            authority: userData.authority,
            phone: userData.phone,
        };
        WriteTable("db_users", userItem);
        console.log(userItem)
        showToast("User Added Successfully", "success");

        setUserData({
            name: '',
            email: '',
            password: '',
            phone: '',
            authority: ''
        });
        setSelectedCenterId('');
    }, [SelectedCenterId, userData, showToast]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
            <Link
                to="/dashboard"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-300"
            >
                Back
            </Link>
            <div className="max-w-6xl mx-auto">
                {/* Header */}

                <div
                    className={`fixed top-6 right-6 z-[60] transition-all duration-300 ${toast.visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-3 pointer-events-none"
                        }`}
                    role="status"

                    aria-live="polite"
                >

                    <div
                        className={`px-4 py-3 rounded-xl shadow-2xl glass-card border backdrop-blur-md min-w-[260px]
          ${toast.type === "success"
                                ? "border-emerald-400/30 bg-emerald-500/10"
                                : "border-rose-400/30 bg-rose-500/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex h-2.5 w-2.5 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"
                                    }`}
                            />
                            <p className="text-sm text-white/90">{toast.message}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto"></div>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">DOF Robotics</h1>
                    <p className="text-blue-300 text-lg">Admin Management Panel</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50">
                        <button
                            onClick={() => setActiveTab('center')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'center'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <Building2 size={18} />
                            Center Registration
                        </button>
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ml-2 ${activeTab === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <Users size={18} />
                            User Registration
                        </button>
                    </div>
                </div>

                {/* Center Registration Panel */}
                {activeTab === 'center' && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Building2 className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Center Registration</h2>
                                <p className="text-gray-400">Add new centers to the DOF network</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Continent */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Globe size={16} className="inline mr-2" />
                                        Continent
                                    </label>
                                    <select
                                        value={selectedRegionId || ""}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedRegionId(id);

                                        }}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select Continent</option>
                                        {continents?.map((continent) => (
                                            <option key={continent.id} value={continent.id}>
                                                {continent.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Globe size={16} className="inline mr-2" />
                                        Country
                                    </label>
                                    <select
                                        value={selectedCountryId || ""}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedCountryId(id);

                                        }}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        disabled={!selectedRegionId}
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {matchedCountries?.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <MapPin size={16} className="inline mr-2" />
                                        City
                                    </label>
                                    <select
                                        value={SelectedCityId || ""}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedCityId(id);
                                            console.log(id)
                                        }}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        disabled={!selectedCountryId}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {matchedCities.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>

                                        ))}
                                    </select>

                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Project Code */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Project Code
                                    </label>
                                    <input
                                        type="text"
                                        value={centerData.projectCode}
                                        onChange={(e) => setCenterData({ ...centerData, projectCode: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter project code"
                                        required
                                    />
                                </div>

                                {/* Center Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Center Name
                                    </label>
                                    <input
                                        type="text"
                                        value={centerData.centerName}
                                        onChange={(e) => setCenterData({ ...centerData, centerName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter center name"
                                        required

                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCenterSubmit}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={20} />
                                Register Center
                            </button>
                        </div>
                    </div>
                )}

                {/* User Registration Panel */}
                {activeTab === 'user' && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                <Users className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">User Registration</h2>
                                <p className="text-gray-400">Add new users to the system</p>
                            </div>
                        </div>

                        <div className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2 relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                        className="w-full px-4 py-3 pr-10 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-11 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        value={userData.phone}
                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                {/* Authority */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Authority</label>
                                    <select
                                        value={userData.authority}
                                        onChange={(e) =>
                                            setUserData({ ...userData, authority: e.target.value })
                                        }
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select Authority</option>
                                        {authorities.map(authority => (
                                            <option key={authority} value={authority}>{authority}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Center Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Center Name</label>
                                    <select
                                        value={userData.centerName}
                                        onChange={(e) => setSelectedCenterId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        disabled={userData.authority === "Admin"}
                                        required
                                    >
                                        <option value="">Select Center</option>
                                        {center?.map((a) => (
                                            <option key={a.id} value={a.centerId}>
                                                {a.project_code + ' - ' + a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>



                            </div>

                            <button
                                type="button"
                                onClick={handleUserSubmit}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={20} />
                                Register User
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;