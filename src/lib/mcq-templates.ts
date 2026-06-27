type MCQQuestion = { question: string; options: string[] };

// Sub-industry-specific MCQ questions (3 questions each)
const SUB_INDUSTRY_MCQS: Record<string, MCQQuestion[]> = {
  // ── Restaurants & Cafes ──
  Restaurants: [
    { question: "What did you order?", options: ["Starters", "Main Course", "Biryani", "Thali", "Dessert", "Full Meal"] },
    { question: "How was the service?", options: ["Super Friendly", "Quick & Efficient", "Very Attentive", "Made My Day"] },
    { question: "What stood out the most?", options: ["Taste of Food", "Presentation", "Ambience", "Portion Size", "Value for Money"] },
  ],
  Cafes: [
    { question: "What did you order?", options: ["Coffee", "Tea", "Sandwich", "Pastry", "Smoothie", "Full Meal"] },
    { question: "How was the vibe?", options: ["Cozy & Relaxing", "Perfect for Work", "Great for Hangout", "Loved the Music"] },
    { question: "What would you recommend?", options: ["The Coffee", "The Ambience", "The Food", "The Desserts", "Everything!"] },
  ],
  "Fast Food": [
    { question: "What did you have?", options: ["Burger", "Pizza", "Fries", "Wrap/Roll", "Combo Meal", "Shake/Drink"] },
    { question: "How was the speed?", options: ["Super Fast", "Right on Time", "Worth the Wait", "Instant Serve"] },
    { question: "What's your favourite here?", options: ["The Burgers", "The Combos", "The Fries", "The Shakes", "Everything!"] },
  ],
  "Fine Dining": [
    { question: "What was the occasion?", options: ["Birthday", "Anniversary", "Date Night", "Business Dinner", "Just Treating Myself"] },
    { question: "How was the presentation?", options: ["Absolutely Stunning", "Restaurant Quality", "Instagram Worthy", "Like Art on a Plate"] },
    { question: "What impressed you most?", options: ["The Chef's Specials", "Wine Selection", "Service & Etiquette", "The Ambience", "Every Course"] },
  ],
  Bakeries: [
    { question: "What did you get?", options: ["Bread", "Cake", "Cookies", "Pastries", "Custom Order", "Brownies"] },
    { question: "How was the freshness?", options: ["Oven Fresh", "Perfectly Baked", "Soft & Delicious", "Best I've Had"] },
    { question: "What would you recommend?", options: ["The Cakes", "The Bread", "The Cookies", "Custom Cakes", "Everything!"] },
  ],
  "Cloud Kitchens": [
    { question: "How did you order?", options: ["Swiggy", "Zomato", "Direct Call", "Website", "WhatsApp"] },
    { question: "How was the delivery?", options: ["Super Fast", "Well Packed", "Hot & Fresh", "On Time"] },
    { question: "What impressed you?", options: ["Taste", "Packaging", "Quantity", "Value for Money", "Consistency"] },
  ],
  "Juice Bars": [
    { question: "What did you have?", options: ["Fresh Juice", "Smoothie", "Shake", "Detox Drink", "Acai Bowl", "Fruit Salad"] },
    { question: "How was the freshness?", options: ["100% Fresh", "Made in Front of Me", "Perfectly Blended", "Best I've Tried"] },
    { question: "What would you recommend?", options: ["Fresh Juices", "Smoothies", "Health Combos", "Shakes", "Everything!"] },
  ],
  "Tea Shops": [
    { question: "What did you have?", options: ["Chai", "Green Tea", "Masala Tea", "Iced Tea", "Snacks & Tea Combo"] },
    { question: "How was the taste?", options: ["Perfect Brew", "Strong & Flavourful", "Just Like Home", "Best Chai Ever"] },
    { question: "What's the best thing here?", options: ["The Chai", "The Snacks", "The Vibe", "The Prices", "The Bun Maska!"] },
  ],

  // ── Beauty & Salon ──
  "Hair Salons": [
    { question: "What service did you get?", options: ["Haircut", "Hair Color", "Styling", "Hair Spa", "Keratin Treatment"] },
    { question: "How was the stylist?", options: ["Very Professional", "Super Creative", "Really Skilled", "Understood Exactly What I Wanted"] },
    { question: "How do you feel after?", options: ["Amazing!", "Fresh & Confident", "Totally Transformed", "Love My New Look"] },
  ],
  "Beauty Parlours": [
    { question: "What service did you get?", options: ["Facial", "Threading", "Waxing", "Bleach", "Full Bridal Package", "Cleanup"] },
    { question: "How was the experience?", options: ["Very Relaxing", "Professional & Hygienic", "Gentle & Caring", "Made Me Feel Special"] },
    { question: "How do you feel after?", options: ["Glowing!", "So Fresh", "Beautiful", "Will Come Back Soon"] },
  ],
  "Nail Studios": [
    { question: "What did you get done?", options: ["Manicure", "Pedicure", "Nail Art", "Gel Nails", "Acrylic Extensions", "French Tips"] },
    { question: "How was the attention to detail?", options: ["Flawless Work", "So Precise", "Exactly What I Wanted", "Better Than Expected"] },
    { question: "How do your nails look?", options: ["Stunning!", "Love the Design", "Instagram Worthy", "Getting Compliments Already"] },
  ],
  "Makeup Artists": [
    { question: "What was the occasion?", options: ["Wedding", "Engagement", "Party", "Photoshoot", "Festival Look", "Everyday Glam"] },
    { question: "How was the makeup?", options: ["Flawless Finish", "Exactly My Style", "Long Lasting", "Natural Yet Stunning"] },
    { question: "What impressed you most?", options: ["Skin Prep", "Color Matching", "Eye Makeup", "Overall Look", "Everything!"] },
  ],
  "Spa & Wellness": [
    { question: "What service did you get?", options: ["Massage", "Body Scrub", "Aromatherapy", "Steam & Sauna", "Full Spa Package"] },
    { question: "How was the ambience?", options: ["So Calming", "Perfectly Relaxing", "Pure Bliss", "Like a Retreat"] },
    { question: "How do you feel after?", options: ["Completely Rejuvenated", "Stress-Free", "Best I've Felt in Weeks", "Already Planning Next Visit"] },
  ],
  "Skincare Clinics": [
    { question: "What treatment did you get?", options: ["Facial Treatment", "Acne Therapy", "Pigmentation", "Anti-Aging", "Laser Treatment", "Consultation"] },
    { question: "How was the dermatologist?", options: ["Very Knowledgeable", "Clear Explanation", "Gentle & Professional", "Really Caring"] },
    { question: "How are the results?", options: ["Visible Improvement", "Skin Feels Great", "Worth Every Penny", "Highly Recommend"] },
  ],
  "Barber Shops": [
    { question: "What did you get?", options: ["Haircut", "Beard Trim", "Shave", "Hair + Beard Combo", "Head Massage"] },
    { question: "How was the barber?", options: ["Skilled & Quick", "Very Professional", "Understood My Style", "Best Barber I've Been To"] },
    { question: "How do you look?", options: ["Sharp!", "Clean & Fresh", "Exactly What I Wanted", "Getting Compliments Already"] },
  ],

  // ── Healthcare & Medical ──
  Clinics: [
    { question: "What was your visit for?", options: ["General Checkup", "Specific Concern", "Consultation", "Follow-up", "Vaccination"] },
    { question: "How was the doctor?", options: ["Very Thorough", "Patient & Caring", "Clear Explanation", "Highly Knowledgeable"] },
    { question: "How was the overall experience?", options: ["Excellent Care", "Short Wait Time", "Clean & Hygienic", "Will Visit Again"] },
  ],
  Hospitals: [
    { question: "What was your visit for?", options: ["OPD Consultation", "Emergency", "Surgery", "Diagnostic Tests", "Admission/Discharge"] },
    { question: "How was the medical staff?", options: ["Very Professional", "Caring & Attentive", "Quick Response", "Made Me Feel Safe"] },
    { question: "What impressed you most?", options: ["Doctor's Expertise", "Nursing Care", "Cleanliness", "Facilities", "Overall Management"] },
  ],
  Dentists: [
    { question: "What treatment did you get?", options: ["Cleaning", "Filling", "Root Canal", "Braces", "Whitening", "Consultation"] },
    { question: "How was the dentist?", options: ["Very Gentle", "Painless Treatment", "Clear Explanation", "Put Me at Ease"] },
    { question: "How do you feel about your smile?", options: ["Love It!", "So Much Better", "Pain Free Finally", "Best Dentist Ever"] },
  ],
  Physiotherapy: [
    { question: "What are you being treated for?", options: ["Back Pain", "Sports Injury", "Post-Surgery Rehab", "Neck/Shoulder Pain", "Joint Issues"] },
    { question: "How was the therapist?", options: ["Very Skilled", "Gentle & Effective", "Clear About Recovery Plan", "Really Caring"] },
    { question: "How's your progress?", options: ["Significant Improvement", "Feeling Much Better", "Pain Has Reduced", "Highly Recommend"] },
  ],
  "Diagnostic Centers": [
    { question: "What test did you get?", options: ["Blood Test", "X-Ray", "MRI/CT Scan", "Ultrasound", "Full Body Checkup", "ECG"] },
    { question: "How was the process?", options: ["Quick & Efficient", "Very Professional", "Minimal Wait", "Well Organized"] },
    { question: "How was the reporting?", options: ["Fast Reports", "Detailed & Clear", "Digital Reports Available", "Doctor Explained Well"] },
  ],
  "Eye Clinics": [
    { question: "What was your visit for?", options: ["Eye Test", "Spectacle Prescription", "Cataract", "Lasik Consultation", "Retina Check", "Contact Lenses"] },
    { question: "How was the eye doctor?", options: ["Very Thorough", "Advanced Equipment", "Clear Explanation", "Patient & Caring"] },
    { question: "How's your vision now?", options: ["Crystal Clear!", "Much Better", "Perfect Prescription", "Highly Recommend"] },
  ],
  "Mental Wellness Centers": [
    { question: "What brought you here?", options: ["Stress/Anxiety", "Counselling", "Therapy Sessions", "General Well-being", "Relationship Issues"] },
    { question: "How was the therapist?", options: ["Very Understanding", "Made Me Feel Safe", "Non-Judgmental", "Truly Helpful"] },
    { question: "How do you feel after?", options: ["Much Lighter", "More Clarity", "Hopeful", "Already Seeing Progress"] },
  ],

  // ── Travel & Hospitality ──
  Hotels: [
    { question: "How long was your stay?", options: ["1 Night", "Weekend Trip", "3-5 Nights", "Week+ Stay"] },
    { question: "What did you love most?", options: ["The Room", "The Food", "The Service", "The Location", "Pool/Amenities"] },
    { question: "How was the hospitality?", options: ["Outstanding", "Very Welcoming", "Like Home", "Beyond Expectations"] },
  ],
  Resorts: [
    { question: "What was the occasion?", options: ["Family Vacation", "Couple Getaway", "Friends Trip", "Corporate Retreat", "Solo Trip"] },
    { question: "What did you enjoy most?", options: ["The Pool", "Spa & Wellness", "Activities", "Food & Dining", "The Views"] },
    { question: "How was the overall experience?", options: ["Paradise!", "Best Vacation Ever", "Totally Refreshing", "Worth Every Penny"] },
  ],
  "Travel Agencies": [
    { question: "What did you book?", options: ["Flight", "Hotel", "Full Package", "Visa Assistance", "Custom Itinerary"] },
    { question: "How was the planning?", options: ["Very Organized", "Great Suggestions", "Budget Friendly", "Handled Everything"] },
    { question: "How was the trip?", options: ["Flawless!", "Exactly As Planned", "Even Better", "Booking Again"] },
  ],
  "Tour Operators": [
    { question: "What type of tour?", options: ["City Tour", "Adventure Tour", "Cultural Tour", "Wildlife Safari", "Pilgrimage"] },
    { question: "How was the guide?", options: ["Very Knowledgeable", "Fun & Engaging", "Well Organized", "Great Storyteller"] },
    { question: "How was the experience?", options: ["Unforgettable!", "Best Tour Ever", "Learned So Much", "Highly Recommend"] },
  ],
  Homestays: [
    { question: "What attracted you?", options: ["Local Experience", "Nature & Peace", "Home-cooked Food", "Affordable Rates", "Unique Property"] },
    { question: "How was the host?", options: ["Very Welcoming", "Like Family", "Super Helpful", "Made Us Feel at Home"] },
    { question: "What would you recommend?", options: ["The Food", "The Location", "The Hospitality", "The Experience", "Everything!"] },
  ],
  "Car Rentals": [
    { question: "What did you rent?", options: ["Hatchback", "Sedan", "SUV", "Self-Drive", "With Driver"] },
    { question: "How was the vehicle?", options: ["Clean & Well-Maintained", "Smooth Drive", "Great Condition", "As Described"] },
    { question: "How was the service?", options: ["Easy Booking", "On-Time Delivery", "Flexible & Helpful", "Great Value"] },
  ],

  // ── Fitness & Gym ──
  Gyms: [
    { question: "What do you focus on?", options: ["Weight Training", "Cardio", "Functional Training", "Bodybuilding", "General Fitness"] },
    { question: "How are the facilities?", options: ["Top Notch Equipment", "Clean & Spacious", "Well Maintained", "Great Variety"] },
    { question: "How are the trainers?", options: ["Very Motivating", "Knowledgeable", "Personalized Attention", "Push You the Right Way"] },
  ],
  "Yoga Studios": [
    { question: "What type of yoga?", options: ["Hatha", "Vinyasa", "Ashtanga", "Power Yoga", "Meditation & Breathing", "Prenatal Yoga"] },
    { question: "How was the instructor?", options: ["Very Peaceful", "Great Corrections", "Inspiring", "Patient & Encouraging"] },
    { question: "How do you feel?", options: ["Centered & Calm", "Flexible & Strong", "Mentally Clear", "Best Yoga Experience"] },
  ],
  "CrossFit Centers": [
    { question: "How was the WOD?", options: ["Intense!", "Challenging but Fun", "Pushed My Limits", "Perfect Scaling"] },
    { question: "How are the coaches?", options: ["Form-Focused", "Very Motivating", "Safety First", "Great Programming"] },
    { question: "What keeps you coming?", options: ["The Community", "Results", "The Challenge", "The Coaches", "Everything!"] },
  ],
  "Personal Trainers": [
    { question: "What's your goal?", options: ["Weight Loss", "Muscle Gain", "Strength", "Flexibility", "Overall Fitness"] },
    { question: "How is the training?", options: ["Customized for Me", "Progressive & Smart", "Challenging but Fun", "Seeing Real Results"] },
    { question: "How is the trainer?", options: ["Very Knowledgeable", "Keeps Me Accountable", "Great Motivator", "Best Decision I Made"] },
  ],
  "Dance Studios": [
    { question: "What style do you learn?", options: ["Bollywood", "Hip Hop", "Contemporary", "Salsa", "Classical", "Zumba"] },
    { question: "How is the instructor?", options: ["Amazing Choreography", "Patient & Fun", "Great Energy", "Breaks It Down Well"] },
    { question: "How do you feel after class?", options: ["Energized!", "So Happy", "Love Dancing Now", "Can't Wait for Next Class"] },
  ],
  "Martial Arts Academies": [
    { question: "What do you practice?", options: ["Karate", "Taekwondo", "MMA", "Boxing", "Judo", "Self Defense"] },
    { question: "How is the sensei/coach?", options: ["Disciplined & Inspiring", "Technically Excellent", "Safety Focused", "Great Mentor"] },
    { question: "What have you gained?", options: ["Confidence", "Discipline", "Fitness", "Self Defense Skills", "All of the Above"] },
  ],

  // ── Events & Entertainment ──
  "Event Planners": [
    { question: "What event did they plan?", options: ["Birthday Party", "Corporate Event", "Anniversary", "Baby Shower", "Get Together"] },
    { question: "How was the execution?", options: ["Flawless!", "Exactly As Envisioned", "Beyond Expectations", "Stress Free for Me"] },
    { question: "What impressed you most?", options: ["Attention to Detail", "Vendor Management", "Creative Ideas", "Budget Management", "Everything!"] },
  ],
  "Wedding Planners": [
    { question: "What did they handle?", options: ["Full Wedding", "Decor Only", "Coordination", "Destination Wedding", "Pre-Wedding Events"] },
    { question: "How was the planning?", options: ["Dream Wedding!", "Every Detail Perfect", "Made It So Easy", "Exceeded All Expectations"] },
    { question: "What stood out?", options: ["The Decor", "Vendor Coordination", "Day-of Management", "Creative Touches", "Everything Was Perfect"] },
  ],
  "Photography Studios": [
    { question: "What was the shoot for?", options: ["Wedding", "Portrait", "Product", "Pre-Wedding", "Baby/Maternity", "Event Coverage"] },
    { question: "How was the photographer?", options: ["Very Creative", "Made Us Comfortable", "Captured Every Moment", "Professional & Fun"] },
    { question: "How are the photos?", options: ["Stunning!", "Better Than Expected", "Love Every Shot", "Worth Every Penny"] },
  ],
  DJs: [
    { question: "What was the event?", options: ["Wedding", "Birthday Party", "Club Night", "Corporate Event", "College Fest"] },
    { question: "How was the music?", options: ["Perfect Playlist", "Great Energy", "Read the Crowd Well", "Non-Stop Dancing"] },
    { question: "How was the overall vibe?", options: ["Electric!", "Best Party Ever", "Everyone Was Dancing", "Unforgettable Night"] },
  ],
  "Event Decorators": [
    { question: "What was decorated?", options: ["Wedding Venue", "Birthday Party", "Stage Setup", "Home Celebration", "Corporate Event"] },
    { question: "How was the decor?", options: ["Breathtaking!", "Exactly My Vision", "Creative & Elegant", "Instagram Worthy"] },
    { question: "What stood out?", options: ["Flower Arrangements", "Lighting", "Theme Execution", "Color Coordination", "Everything!"] },
  ],

  // ── Education & Training ──
  "Coaching Institutes": [
    { question: "What are you preparing for?", options: ["Engineering (JEE/CET)", "Medical (NEET)", "UPSC/MPSC", "CA/CS", "Bank Exams", "Other Competitive"] },
    { question: "How are the teachers?", options: ["Concept Clarity", "Doubt Solving", "Exam-Focused", "Very Experienced"] },
    { question: "How's your preparation going?", options: ["Confident Now", "Much Better Understanding", "Regular Tests Help", "Best Coaching Decision"] },
  ],
  Schools: [
    { question: "What do you appreciate most?", options: ["Teaching Quality", "Extra Activities", "Individual Attention", "School Environment", "Safety & Discipline"] },
    { question: "How are the teachers?", options: ["Very Caring", "Highly Qualified", "Understand Each Child", "Go Beyond Syllabus"] },
    { question: "How is your child's experience?", options: ["Loves Going to School", "Learning & Growing", "Made Great Friends", "Confident & Happy"] },
  ],
  Colleges: [
    { question: "What are you studying?", options: ["Engineering", "Medical", "Commerce", "Arts", "Science", "Management"] },
    { question: "How's the college experience?", options: ["Great Faculty", "Good Placements", "Active Campus Life", "Industry Exposure"] },
    { question: "What would you highlight?", options: ["Teaching Quality", "Labs & Facilities", "Campus Life", "Placement Support", "Overall Growth"] },
  ],
  "Online Courses": [
    { question: "What did you learn?", options: ["Programming", "Design", "Marketing", "Data Science", "Business Skills", "Language"] },
    { question: "How was the course?", options: ["Well Structured", "Very Practical", "Easy to Follow", "Great Assignments"] },
    { question: "What's the impact?", options: ["Got a Job/Promotion", "New Skills", "Career Switch", "Confidence Boost", "Totally Worth It"] },
  ],
  "Skill Training Centers": [
    { question: "What skill did you learn?", options: ["Computer Skills", "Spoken English", "Technical Trade", "Soft Skills", "Professional Course"] },
    { question: "How was the training?", options: ["Hands-On Practice", "Expert Trainers", "Industry Relevant", "Well Paced"] },
    { question: "How has it helped?", options: ["Got Employment", "Better at Work", "More Confident", "Ready for Career", "Life Changing"] },
  ],
  "Tuition Classes": [
    { question: "What subject?", options: ["Maths", "Science", "English", "Accounts", "Multiple Subjects", "Board Exam Prep"] },
    { question: "How is the teacher?", options: ["Explains Clearly", "Very Patient", "Makes It Interesting", "Focuses on Weak Areas"] },
    { question: "How are the results?", options: ["Marks Improved!", "Understanding Is Better", "More Confident in Exams", "Best Teacher I've Had"] },
  ],
  "Music Academies": [
    { question: "What do you learn?", options: ["Vocals", "Guitar", "Piano/Keyboard", "Drums", "Tabla/Harmonium", "Music Production"] },
    { question: "How is the instructor?", options: ["Very Talented", "Patient & Encouraging", "Structured Teaching", "Brings Out the Best"] },
    { question: "How's your progress?", options: ["Playing Confidently", "Love Music Even More", "Can Perform Now", "Best Decision Ever"] },
  ],
};

// Industry-level fallback MCQs (when sub-industry doesn't match)
const INDUSTRY_MCQS: Record<string, MCQQuestion[]> = {
  restaurants_cafes: [
    { question: "What did you have?", options: ["Food", "Beverages", "Snacks", "Dessert", "Full Meal"] },
    { question: "How was the service?", options: ["Super Friendly", "Quick & Efficient", "Very Attentive", "Made My Day"] },
    { question: "What would you recommend?", options: ["The Food", "The Ambience", "The Drinks", "The Desserts", "Everything!"] },
  ],
  beauty_salon: [
    { question: "What service did you get?", options: ["Hair", "Skin", "Nails", "Makeup", "Full Package"] },
    { question: "How was the staff?", options: ["Very Professional", "Super Friendly", "Really Skilled", "Made Me Comfortable"] },
    { question: "How do you feel?", options: ["Amazing!", "Fresh & Confident", "Totally Transformed", "Coming Back Soon"] },
  ],
  healthcare_medical: [
    { question: "What was your visit for?", options: ["Checkup", "Consultation", "Treatment", "Follow-up", "Diagnostic Test"] },
    { question: "How was the doctor/staff?", options: ["Very Thorough", "Patient & Caring", "Clear Explanation", "Highly Professional"] },
    { question: "How was the care?", options: ["Excellent", "Very Professional", "Caring & Gentle", "Highly Recommend"] },
  ],
  travel_hospitality: [
    { question: "What was the purpose?", options: ["Vacation", "Business Trip", "Weekend Getaway", "Family Trip", "Adventure"] },
    { question: "What did you love most?", options: ["The Service", "The Location", "The Food", "The Experience", "Everything!"] },
    { question: "How was the hospitality?", options: ["Outstanding", "Very Welcoming", "Beyond Expectations", "Will Visit Again"] },
  ],
  fitness_gym: [
    { question: "What do you do here?", options: ["Weight Training", "Cardio", "Group Classes", "Yoga", "Personal Training"] },
    { question: "How are the facilities?", options: ["Top Notch", "Clean & Well-Maintained", "Great Equipment", "Spacious"] },
    { question: "How is the staff?", options: ["Very Motivating", "Knowledgeable", "Super Friendly", "Always Helpful"] },
  ],
  events_entertainment: [
    { question: "What was the occasion?", options: ["Wedding", "Birthday", "Corporate Event", "Party", "Cultural Event"] },
    { question: "How was the execution?", options: ["Flawless!", "Beyond Expectations", "Very Professional", "Stress Free"] },
    { question: "What impressed you?", options: ["Creativity", "Coordination", "Attention to Detail", "Value for Money", "Everything!"] },
  ],
  education_training: [
    { question: "What are you learning?", options: ["Academic Subject", "Skill Course", "Competitive Exam", "Language", "Professional Course"] },
    { question: "How is the teaching?", options: ["Concept Clear", "Engaging", "Practical Approach", "Very Experienced"] },
    { question: "How has it helped?", options: ["Better Understanding", "Improved Results", "More Confident", "Career Growth", "Highly Recommend"] },
  ],
};

// Generic fallback
const GENERIC_MCQS: MCQQuestion[] = [
  { question: "What brought you here?", options: ["Recommendation", "Found Online", "Walk-in", "Regular Visit", "Social Media"] },
  { question: "How was your experience?", options: ["Excellent", "Very Good", "Loved It", "Will Return"] },
  { question: "Would you recommend this place?", options: ["Absolutely!", "Already Have", "100% Yes", "My Go-To Place"] },
];

export function getMCQQuestions(industrySegment: string, subIndustry: string): MCQQuestion[] {
  if (subIndustry && SUB_INDUSTRY_MCQS[subIndustry]) {
    return SUB_INDUSTRY_MCQS[subIndustry];
  }
  if (industrySegment && INDUSTRY_MCQS[industrySegment]) {
    return INDUSTRY_MCQS[industrySegment];
  }
  return GENERIC_MCQS;
}

// ── Review generation based on industry, sub-industry, rating, and MCQ answers ──

const REVIEW_TEMPLATES: Record<string, (biz: string, area: string, city: string, answers: Record<string, string>) => string[]> = {
  // Restaurants & Cafes
  restaurants_cafes: (biz, area, city, answers) => {
    const item = answers[Object.keys(answers)[0]] || "the food";
    const vibe = answers[Object.keys(answers)[1]] || "great service";
    return [
      `Had ${item.toLowerCase()} at ${biz} in ${area} and it was absolutely delicious! The ${vibe.toLowerCase()} made the experience even better. Must visit if you're in ${city}!`,
      `${biz} in ${area}, ${city} never disappoints. Ordered ${item.toLowerCase()} and loved every bite. The staff is always so welcoming. Highly recommend!`,
      `If you're looking for great food in ${area}, ${biz} is the place. The ${item.toLowerCase()} was perfect and the overall experience was top-notch. Will definitely come back!`,
    ];
  },
  // Beauty & Salon
  beauty_salon: (biz, area, city, answers) => {
    const service = answers[Object.keys(answers)[0]] || "the service";
    const feeling = answers[Object.keys(answers)[2]] || "amazing";
    return [
      `Got ${service.toLowerCase()} done at ${biz} in ${area} and I feel ${feeling.toLowerCase()}! The staff is so professional and skilled. Best salon experience in ${city}!`,
      `${biz} in ${area} is my go-to for ${service.toLowerCase()}. Every visit leaves me feeling ${feeling.toLowerCase()}. Highly recommend to everyone in ${city}!`,
      `Visited ${biz} for ${service.toLowerCase()} and the results were outstanding. The team really knows what they're doing. Best in ${area}, ${city}!`,
    ];
  },
  // Healthcare & Medical
  healthcare_medical: (biz, area, city, answers) => {
    const visit = answers[Object.keys(answers)[0]] || "consultation";
    const quality = answers[Object.keys(answers)[1]] || "very professional";
    return [
      `Visited ${biz} in ${area} for ${visit.toLowerCase()}. The doctor was ${quality.toLowerCase()} and explained everything clearly. Best medical care in ${city}!`,
      `${biz} in ${area}, ${city} provides excellent healthcare. My ${visit.toLowerCase()} went smoothly and the staff was ${quality.toLowerCase()}. Highly recommend!`,
      `Had a great experience at ${biz} for ${visit.toLowerCase()}. The medical team is ${quality.toLowerCase()} and truly caring. Will recommend to everyone in ${city}!`,
    ];
  },
  // Travel & Hospitality
  travel_hospitality: (biz, area, city, answers) => {
    const highlight = answers[Object.keys(answers)[1]] || "the service";
    return [
      `Stayed at ${biz} in ${area}, ${city} and it was an incredible experience! ${highlight} was outstanding. Will definitely visit again!`,
      `${biz} in ${area} exceeded all expectations. ${highlight} made our stay truly memorable. One of the best places in ${city}!`,
      `Our experience at ${biz}, ${area} was phenomenal. From check-in to check-out, ${highlight.toLowerCase()} was exceptional. Highly recommend for anyone visiting ${city}!`,
    ];
  },
  // Fitness & Gym
  fitness_gym: (biz, area, city, answers) => {
    const activity = answers[Object.keys(answers)[0]] || "training";
    const staff = answers[Object.keys(answers)[2]] || "great trainers";
    return [
      `Been training at ${biz} in ${area} and the ${activity.toLowerCase()} sessions are amazing! The ${staff.toLowerCase()} make all the difference. Best fitness spot in ${city}!`,
      `${biz} in ${area}, ${city} has transformed my fitness journey. Love the ${activity.toLowerCase()} setup and the ${staff.toLowerCase()}. Highly recommend!`,
      `If you want ${activity.toLowerCase()} in ${area}, ${biz} is the place. The ${staff.toLowerCase()} and facilities are top-notch. Best gym experience in ${city}!`,
    ];
  },
  // Events & Entertainment
  events_entertainment: (biz, area, city, answers) => {
    const event = answers[Object.keys(answers)[0]] || "our event";
    const quality = answers[Object.keys(answers)[1]] || "flawless execution";
    return [
      `${biz} in ${area} handled ${event.toLowerCase()} perfectly! The ${quality.toLowerCase()} was beyond expectations. Best event team in ${city}!`,
      `Hired ${biz} for ${event.toLowerCase()} and they delivered magic! ${quality} from start to finish. Highly recommend for anyone in ${city}!`,
      `Our ${event.toLowerCase()} was made unforgettable by ${biz}, ${area}. The ${quality.toLowerCase()} and creativity were exceptional. Best in ${city}!`,
    ];
  },
  // Education & Training
  education_training: (biz, area, city, answers) => {
    const subject = answers[Object.keys(answers)[0]] || "my course";
    const impact = answers[Object.keys(answers)[2]] || "really helped";
    return [
      `Joined ${biz} in ${area} for ${subject.toLowerCase()} and it has ${impact.toLowerCase()}! The teaching quality is outstanding. Best in ${city}!`,
      `${biz} in ${area}, ${city} is excellent for ${subject.toLowerCase()}. The approach is very practical and it ${impact.toLowerCase()}. Highly recommend!`,
      `My experience at ${biz} for ${subject.toLowerCase()} has been amazing. The faculty is dedicated and it has ${impact.toLowerCase()}. Top choice in ${city}!`,
    ];
  },
};

const GENERIC_REVIEW_TEMPLATE = (biz: string, area: string, city: string, _answers: Record<string, string>) => [
  `Visited ${biz} in ${area} and had an absolutely wonderful experience. The staff was super friendly and everything was top-notch. Definitely coming back!`,
  `Had an amazing time at ${biz}, ${area} ${city}. The quality is outstanding and the service was quick and efficient. Highly recommend this place!`,
  `${biz} has become my go-to spot in ${area}. Everything exceeded my expectations. Love the vibe — highly recommend to anyone visiting ${city}!`,
];

export function generateIndustryReviews(
  businessName: string,
  area: string,
  city: string,
  industrySegment: string,
  mcqAnswers: Record<string, string>,
): string[] {
  const templateFn = REVIEW_TEMPLATES[industrySegment] || GENERIC_REVIEW_TEMPLATE;
  return templateFn(businessName, area, city, mcqAnswers);
}
