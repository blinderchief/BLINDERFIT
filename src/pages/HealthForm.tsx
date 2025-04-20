import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHealthData, HealthData } from '@/contexts/HealthDataContext';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

const HealthForm = () => {
  const { updateHealthData, healthData: existingHealthData } = useHealthData();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<HealthData>(existingHealthData || {
    age: 30,
    weight: 70,
    height: 170,
    gender: 'male',
    activityLevel: 'moderate',
    goals: ['weight_loss'],
    healthIssues: [],
    fitnessLevel: 'intermediate',
    availableTime: 60,
    preferredWorkoutDays: ['monday', 'wednesday', 'friday']
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      const arrayField = name.split('.')[0] as keyof HealthData;
      const arrayValue = name.split('.')[1];
      
      setFormData(prev => {
        const currentArray = [...(prev[arrayField] as string[])];
        
        if (isChecked && !currentArray.includes(arrayValue)) {
          return { ...prev, [arrayField]: [...currentArray, arrayValue] };
        } else if (!isChecked && currentArray.includes(arrayValue)) {
          return { ...prev, [arrayField]: currentArray.filter(item => item !== arrayValue) };
        }
        
        return prev;
      });
      
      if (errors[arrayField]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[arrayField];
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
      
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch(step) {
      case 1:
        if (!formData.age) newErrors.age = "Age is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.weight) newErrors.weight = "Weight is required";
        if (!formData.height) newErrors.height = "Height is required";
        break;
      case 2:
        if (!formData.fitnessLevel) newErrors.fitnessLevel = "Fitness level is required";
        if (!formData.activityLevel) newErrors.activityLevel = "Activity level is required";
        if (formData.goals.length === 0) newErrors.goals = "At least one goal is required";
        break;
      case 3:
        break;
      case 4:
        if (!formData.availableTime) newErrors.availableTime = "Available time is required";
        if (formData.preferredWorkoutDays.length === 0) {
          newErrors.preferredWorkoutDays = "At least one workout day is required";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      if (Object.keys(errors).length > 0) {
        toast.error("Please fill in all required fields");
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      updateHealthData(formData);
      toast.success('Health data saved successfully!');
      navigate('/fitness-plan');
    } else {
      toast.error("Please fill in all required fields");
    }
  };
  
  const isChecked = (arrayName: keyof HealthData, value: string) => {
    return (formData[arrayName] as string[]).includes(value);
  };
  
  const renderError = (field: string) => {
    if (!errors[field]) return null;
    
    return (
      <div className="text-red-500 text-sm mt-1 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {errors[field]}
      </div>
    );
  };
  
  return (
    <div className="min-h-[calc(100vh-96px)] py-12">
      <div className="gofit-container">
        <div className="max-w-3xl mx-auto bg-gofit-charcoal p-8 sm:p-10 border border-gofit-charcoal/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light tracking-wider text-gofit-offwhite">
              Your Health <span className="text-gofit-gold">Profile</span>
            </h2>
            <p className="mt-2 text-gofit-silver">
              Help us create your personalized fitness plan
            </p>
          </div>
          
          <div className="mb-10">
            <div className="flex justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      currentStep > index + 1 
                        ? 'bg-gofit-gold text-gofit-black' 
                        : currentStep === index + 1 
                          ? 'bg-gofit-gold/20 text-gofit-gold border border-gofit-gold' 
                          : 'bg-gofit-black/40 text-gofit-silver border border-gofit-silver/30'
                    }`}
                  >
                    {currentStep > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className={`text-xs ${currentStep === index + 1 ? 'text-gofit-gold' : 'text-gofit-silver'}`}>
                    {index === 0 ? 'Basics' : 
                     index === 1 ? 'Goals' :
                     index === 2 ? 'Health' : 'Schedule'}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full bg-gofit-black/40 h-1 mt-4 rounded-full">
              <div 
                className="bg-gofit-gold h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-light text-gofit-offwhite mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="age" className="block text-gofit-silver mb-2">Age <span className="text-red-500">*</span></label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="18"
                      max="100"
                      required
                      value={formData.age}
                      onChange={handleNumericChange}
                      className={`w-full py-3 px-4 bg-gofit-black border ${errors.age ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                    />
                    {renderError('age')}
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-gofit-silver mb-2">Gender <span className="text-red-500">*</span></label>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full py-3 px-4 bg-gofit-black border ${errors.gender ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {renderError('gender')}
                  </div>
                  
                  <div>
                    <label htmlFor="weight" className="block text-gofit-silver mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      min="30"
                      max="250"
                      step="0.1"
                      required
                      value={formData.weight}
                      onChange={handleNumericChange}
                      className={`w-full py-3 px-4 bg-gofit-black border ${errors.weight ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                    />
                    {renderError('weight')}
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="block text-gofit-silver mb-2">Height (cm) <span className="text-red-500">*</span></label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      min="100"
                      max="250"
                      required
                      value={formData.height}
                      onChange={handleNumericChange}
                      className={`w-full py-3 px-4 bg-gofit-black border ${errors.height ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                    />
                    {renderError('height')}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-light text-gofit-offwhite mb-4">Your Goals</h3>
                
                <div>
                  <label className="block text-gofit-silver mb-2">What are your fitness goals? <span className="text-red-500">*</span></label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="weight_loss"
                        name="goals.weight_loss"
                        type="checkbox"
                        checked={isChecked('goals', 'weight_loss')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="weight_loss" className="ml-3 text-gofit-offwhite">Weight Loss</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="muscle_gain"
                        name="goals.muscle_gain"
                        type="checkbox"
                        checked={isChecked('goals', 'muscle_gain')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="muscle_gain" className="ml-3 text-gofit-offwhite">Muscle Gain</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="endurance"
                        name="goals.endurance"
                        type="checkbox"
                        checked={isChecked('goals', 'endurance')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="endurance" className="ml-3 text-gofit-offwhite">Endurance</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="flexibility"
                        name="goals.flexibility"
                        type="checkbox"
                        checked={isChecked('goals', 'flexibility')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="flexibility" className="ml-3 text-gofit-offwhite">Flexibility</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="overall_health"
                        name="goals.overall_health"
                        type="checkbox"
                        checked={isChecked('goals', 'overall_health')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="overall_health" className="ml-3 text-gofit-offwhite">Overall Health</label>
                    </div>
                  </div>
                  {renderError('goals')}
                </div>
                
                <div>
                  <label htmlFor="fitnessLevel" className="block text-gofit-silver mb-2">Current Fitness Level <span className="text-red-500">*</span></label>
                  <select
                    id="fitnessLevel"
                    name="fitnessLevel"
                    required
                    value={formData.fitnessLevel}
                    onChange={handleChange}
                    className={`w-full py-3 px-4 bg-gofit-black border ${errors.fitnessLevel ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                  >
                    <option value="beginner">Beginner (New to exercise)</option>
                    <option value="intermediate">Intermediate (Exercise regularly)</option>
                    <option value="advanced">Advanced (Very active)</option>
                  </select>
                  {renderError('fitnessLevel')}
                </div>
                
                <div>
                  <label htmlFor="activityLevel" className="block text-gofit-silver mb-2">Daily Activity Level <span className="text-red-500">*</span></label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    required
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className={`w-full py-3 px-4 bg-gofit-black border ${errors.activityLevel ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                  >
                    <option value="sedentary">Sedentary (Office job, little movement)</option>
                    <option value="light">Light (Standing job, some walking)</option>
                    <option value="moderate">Moderate (Active job, regular movement)</option>
                    <option value="active">Active (Physical job, lots of movement)</option>
                    <option value="very_active">Very Active (Athletic job or lifestyle)</option>
                  </select>
                  {renderError('activityLevel')}
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-light text-gofit-offwhite mb-4">Health Information</h3>
                
                <div>
                  <label className="block text-gofit-silver mb-2">Do you have any health concerns?</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="joint_pain"
                        name="healthIssues.joint_pain"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'joint_pain')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="joint_pain" className="ml-3 text-gofit-offwhite">Joint Pain</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="back_pain"
                        name="healthIssues.back_pain"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'back_pain')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="back_pain" className="ml-3 text-gofit-offwhite">Back Pain</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="heart_condition"
                        name="healthIssues.heart_condition"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'heart_condition')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="heart_condition" className="ml-3 text-gofit-offwhite">Heart Condition</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="hypertension"
                        name="healthIssues.hypertension"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'hypertension')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="hypertension" className="ml-3 text-gofit-offwhite">Hypertension</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="diabetes"
                        name="healthIssues.diabetes"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'diabetes')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="diabetes" className="ml-3 text-gofit-offwhite">Diabetes</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="asthma"
                        name="healthIssues.asthma"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'asthma')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="asthma" className="ml-3 text-gofit-offwhite">Asthma</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="none"
                        name="healthIssues.none"
                        type="checkbox"
                        checked={isChecked('healthIssues', 'none')}
                        onChange={handleChange}
                        className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                      />
                      <label htmlFor="none" className="ml-3 text-gofit-offwhite">None</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-light text-gofit-offwhite mb-4">Your Schedule</h3>
                
                <div>
                  <label htmlFor="availableTime" className="block text-gofit-silver mb-2">
                    Time available for exercise (minutes per day) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="availableTime"
                    name="availableTime"
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    required
                    value={formData.availableTime}
                    onChange={handleNumericChange}
                    className={`w-full py-3 px-4 bg-gofit-black border ${errors.availableTime ? 'border-red-500' : 'border-gofit-charcoal/50'} text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent`}
                  />
                  {renderError('availableTime')}
                </div>
                
                <div>
                  <label className="block text-gofit-silver mb-2">Preferred workout days <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          id={day}
                          name={`preferredWorkoutDays.${day}`}
                          type="checkbox"
                          checked={isChecked('preferredWorkoutDays', day)}
                          onChange={handleChange}
                          className="h-5 w-5 border-gofit-charcoal/50 text-gofit-gold focus:ring-gofit-gold/50"
                        />
                        <label htmlFor={day} className="ml-3 text-gofit-offwhite capitalize">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                  {renderError('preferredWorkoutDays')}
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="gofit-button-outline flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="gofit-button flex items-center"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="gofit-button flex items-center"
                >
                  Create My Plan <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
