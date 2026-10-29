import { CyberCafeToolInfo, ExamPortalSpec, DocumentTemplate } from '../types/cybercafe';

export const CYBER_CAFE_TOOLS: CyberCafeToolInfo[] = [
  {
    id: 'whatsapp_print',
    title: '1-Click WhatsApp Photo to Print',
    titleBengali: 'হোয়াটসঅ্যাপ ফটো ডিরেক্ট প্রিন্ট (১-ক্লিক)',
    description: 'Upload or paste customer WhatsApp photo: auto-straightens, auto-crops to passport size, enhances clarity, and opens direct print instantly.',
    descriptionBengali: 'হোয়াটসঅ্যাপের ছবি সরাসরি আপলোড বা পেস্ট করুন: সাথে সাথে সোজা হবে, সঠিক সাইজে ক্রপ হবে এবং ডিরেক্ট প্রিন্ট রেডি হয়ে যাবে।',
    category: 'photo',
    priority: true,
    badge: '⚡ 1-Click Fast'
  },
  {
    id: 'photo_fixer',
    title: 'AI Photo Fixer',
    titleBengali: 'এআই ফটো ফিক্সার',
    description: 'Fix blurry WhatsApp photos, adjust brightness, contrast, sharpness, rotate and straighten tilted photos.',
    descriptionBengali: 'হোয়াটসঅ্যাপের ঝাপসা ছবি স্পষ্ট করুন, উজ্জ্বলতা বাড়ান ও সোজা করুন।',
    category: 'photo',
    priority: true,
    badge: 'High Priority'
  },
  {
    id: 'passport_maker',
    title: 'Passport Photo Maker',
    titleBengali: 'পাসপোর্ট ফটো মেকার',
    description: 'Auto-crop 1.2in x 1.5in, replace background color, arrange on 4x6 or A4 sheets (6, 6, 12, 16 photos), print or PDF.',
    descriptionBengali: '১.২x১.৫ ইঞ্চি অটো-ক্রপ, ব্যাকগ্রাউন্ড পরিবর্তন, ৪x৬ বা A4 শীটে ৬, ৮, ১২, ১৬ ফটো প্রিন্ট বা পিডিএফ।',
    category: 'photo',
    priority: true,
    badge: 'Popular'
  },
  {
    id: 'kb_resizer',
    title: 'Photo KB Resizer',
    titleBengali: 'ফটো কেবি রিসাইজার',
    description: 'Compress images to exact 20 KB, 50 KB, 100 KB or custom size with dimension & DPI controls.',
    descriptionBengali: 'সরাসরি ২০ কেবি, ৫০ কেবি, ১০০ কেবি সাইজে ছবি নির্ভুলভাবে কম্প্রেস করুন।',
    category: 'resizer',
    priority: true
  },
  {
    id: 'signature_resizer',
    title: 'Signature Resizer',
    titleBengali: 'স্বাক্ষর রিসাইজার ও ক্লিনার',
    description: 'Crop signatures, clean paper background to pure white, boost ink clarity, compress to 10-20 KB.',
    descriptionBengali: 'স্বাক্ষর ক্রপ করুন, ব্যাকগ্রাউন্ড ধবধবে সাদা করুন এবং ১০-২০ কেবিতে নামিয়ে আনুন।',
    category: 'resizer',
    priority: true
  },
  {
    id: 'pdf_merger',
    title: 'PDF Merger',
    titleBengali: 'পিডিএফ জোড়া লাগান (PDF Merger)',
    description: 'Upload multiple PDF files, easily arrange and reorder documents with up/down arrows, inspect page counts, and download combined PDF.',
    descriptionBengali: 'একাধিক পিডিএফ ফাইল আপলোড করুন, সহজে ক্রমানুসারে সাজান এবং একটি ফাইলে মার্জ করে ডাউনলোড করুন।',
    category: 'pdf',
    priority: true,
    badge: 'Popular'
  },
  {
    id: 'pdf_splitter',
    title: 'PDF Splitter',
    titleBengali: 'পিডিএফ পাতা আলাদা করুন (PDF Splitter)',
    description: 'Input page ranges (e.g. 1-3, 5), interactively select individual pages, and download specific sections as a new PDF file.',
    descriptionBengali: 'নির্দিষ্ট পাতা বা রেঞ্জ (যেমন: ১-৩, ৫) আলাদা করে নতুন পিডিএফ ফাইল হিসেবে ডাউনলোড করুন।',
    category: 'pdf',
    priority: true,
    badge: 'Popular'
  },
  {
    id: 'pdf_tools',
    title: 'All-in-One PDF Tools',
    titleBengali: 'পিডিএফ টুলস (PDF Tools)',
    description: 'Compress PDF size, merge multiple PDFs, split pages, convert image scans to formatted PDF.',
    descriptionBengali: 'পিডিএফ সাইজ কমান, একাধিক ফাইল জোড়া দিন, পাতা আলাদা করুন ও ছবি থেকে পিডিএফ তৈরি করুন।',
    category: 'pdf'
  },
  {
    id: 'id_card_layout',
    title: 'ID Card Print Layout',
    titleBengali: 'আইডি কার্ড প্রিন্ট লেআউট',
    description: 'Arrange front & back card images (Aadhaar, Voter, PAN) on A4 or 4x6 photo paper with cut marks.',
    descriptionBengali: 'আধার, ভোটার বা প্যান কার্ডের দুই দিক প্রিন্ট করার জন্য সাজিয়ে নিন।',
    category: 'photo'
  },
  {
    id: 'image_converter',
    title: 'Image Converter',
    titleBengali: 'ইমেজ কনভার্টার',
    description: 'Convert between JPG, PNG, and WebP with instant file size report and batch download.',
    descriptionBengali: 'জেপিজি, পিএনজি এবং ওয়েবপি ফরম্যাটে দ্রুত রূপান্তর করুন।',
    category: 'utility'
  },
  {
    id: 'typing_tools',
    title: 'Typing & Document Letters',
    titleBengali: 'টাইপিং ও দরখাস্ত ড্রাফটার',
    description: 'Bilingual Bengali & English editor with instant templates for Police GD, Job, Bank, and School letters.',
    descriptionBengali: 'বাংলা ও ইংরেজি সাধারণ দরখাস্ত, পুলিশ জিডি ও ব্যাংকের আবেদনপত্র প্রস্তুত করুন।',
    category: 'document'
  },
  {
    id: 'form_checker',
    title: 'Form Photo Checker',
    titleBengali: 'ফর্ম ফটো চেকার',
    description: 'Verify dimensions, file size and format against SSC, UPSC, IBPS, PAN, Passport or custom criteria.',
    descriptionBengali: 'এসএসসি, ইউপিএসসি, প্যান ও সরকারি চাকরির নিয়মানুযায়ী ছবি ও স্বাক্ষর যাচাই করুন।',
    category: 'utility'
  }
];

export const EXAM_PORTAL_SPECS: ExamPortalSpec[] = [
  {
    id: 'ssc',
    name: 'SSC (Staff Selection Commission)',
    organization: 'Govt of India (CGL, CHSL, MTS, GD)',
    photoSpec: {
      minKb: 20,
      maxKb: 50,
      widthCm: 3.5,
      heightCm: 4.5,
      widthPx: 350,
      heightPx: 450,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'Plain white or very light background. Face should occupy 70-80% of photo.',
      description: 'Recent 3-month color photo without cap or spectacles. 20 KB to 50 KB.'
    },
    signatureSpec: {
      minKb: 10,
      maxKb: 20,
      widthCm: 4.0,
      heightCm: 2.0,
      widthPx: 280,
      heightPx: 120,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      description: 'Black or dark blue ink on white paper, clearly visible. 10 KB to 20 KB.'
    }
  },
  {
    id: 'upsc',
    name: 'UPSC (Union Public Service Commission)',
    organization: 'Civil Services / NDA / CDS / EPFO',
    photoSpec: {
      minKb: 20,
      maxKb: 300,
      widthPx: 350,
      heightPx: 350,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'Plain white background preferred. Full frontal view.',
      description: 'Clear photograph taken within 10 days of filling form. 20 KB to 300 KB.'
    },
    signatureSpec: {
      minKb: 20,
      maxKb: 300,
      widthPx: 350,
      heightPx: 350,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      description: 'Candidate handwritten signature on plain white paper. 20 KB to 300 KB.'
    }
  },
  {
    id: 'pan_card',
    name: 'PAN Card (NSDL / UTIITSL)',
    organization: 'Income Tax Dept Govt of India',
    photoSpec: {
      minKb: 10,
      maxKb: 50,
      widthCm: 2.5,
      heightCm: 3.5,
      widthPx: 213,
      heightPx: 213,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'Pure white background, 200 or 300 DPI.',
      description: 'Passport-style color portrait. Max 50 KB.'
    },
    signatureSpec: {
      minKb: 5,
      maxKb: 20,
      widthCm: 4.5,
      heightCm: 2.0,
      widthPx: 400,
      heightPx: 200,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      description: 'Black ink only on white paper. Max 20 KB.'
    }
  },
  {
    id: 'passport_seva',
    name: 'Indian Passport Seva',
    organization: 'Ministry of External Affairs',
    photoSpec: {
      minKb: 20,
      maxKb: 300,
      widthCm: 3.5,
      heightCm: 4.5,
      widthPx: 413,
      heightPx: 531,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'Plain white background only. No shadows or uniforms.',
      description: '3.5cm x 4.5cm, 70-80% face coverage. 20 KB to 300 KB.'
    }
  },
  {
    id: 'ibps',
    name: 'IBPS (Bank PO, Clerk, SO, RRB)',
    organization: 'Institute of Banking Personnel Selection',
    photoSpec: {
      minKb: 20,
      maxKb: 50,
      widthCm: 3.5,
      heightCm: 4.5,
      widthPx: 200,
      heightPx: 230,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'Light-colored, preferably white background.',
      description: '20 KB to 50 KB color passport photograph.'
    },
    signatureSpec: {
      minKb: 10,
      maxKb: 20,
      widthPx: 140,
      heightPx: 60,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      description: 'Black ink pen signature on white paper. No capital letters only. 10 to 20 KB.'
    }
  },
  {
    id: 'wbpsc',
    name: 'WBPSC & West Bengal Police (WBP)',
    organization: 'West Bengal Public Service / Police Recruitment Board',
    photoSpec: {
      minKb: 20,
      maxKb: 100,
      widthCm: 3.5,
      heightCm: 4.5,
      widthPx: 350,
      heightPx: 450,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      bgNote: 'White or very light monochrome background.',
      description: 'Passport size photo. 20 KB to 100 KB.'
    },
    signatureSpec: {
      minKb: 10,
      maxKb: 50,
      widthCm: 4.0,
      heightCm: 2.0,
      widthPx: 350,
      heightPx: 175,
      allowedFormats: ['image/jpeg', 'image/jpg'],
      description: 'Signature on white paper. 10 KB to 50 KB.'
    }
  }
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'police_gd_lost',
    title: 'Police Station GD for Lost Document (Aadhaar / Voter / Phone)',
    titleBengali: 'থানায় নথি হারানোর জন্য জিডি (সাধারণ ডায়েরি) আবেদন',
    category: 'police',
    description: 'Format for reporting lost documents like Aadhaar card, Voter card, PAN, or Mobile phone.',
    englishContent: `To,
The Officer-in-Charge,
[Police Station Name] Police Station,
[District / City Name].

Subject: General Diary (GD) Entry regarding loss of [Document Name, e.g. Aadhaar Card / Mobile Phone].

Respected Sir/Madam,

I, [Full Name], son/daughter of [Father's Name], residing at [Complete Village/Ward, Post Office, Police Station, District, PIN Code], would like to bring to your kind notice that on [Date of Loss] at approximately [Time, e.g. 3:00 PM], I lost my [Document Name with Number, e.g. Aadhaar Card No: XXXX-XXXX-XXXX] while traveling from [Source Location] to [Destination Location].

Despite my sincere and diligent search in and around the area, I have been unable to trace or recover it.

I request you to kindly register a General Diary (GD) entry regarding this matter and provide me with a stamped copy of the GD acknowledgment for future official reference and re-issuance of the document.

Thanking you.

Yours faithfully,

(Signature)
Name: [Full Name]
Mobile Number: [10-digit Phone Number]
Date: [DD/MM/YYYY]
Place: [Village / Town Name]`,
    bengaliContent: `বরাবর,
ভারপ্রাপ্ত আধিকারিক (Officer-in-Charge),
[থানার নাম] থানা,
[জেলার নাম]।

বিষয়: [নথির নাম, যেমন: আধার কার্ড / ভোটার কার্ড / মোবাইল ফোন] হারানোর জন্য সাধারণ ডায়েরি (GD) করার আবেদন।

মহাশয়,

বিনীত নিবেদন এই যে, আমি [আপনার পুরো নাম], পিতা/স্বামী: [পিতা বা স্বামীর নাম], সাং: [গ্রাম/ওয়ার্ড], ডাকঘর: [পোস্ট অফিস], থানা: [থানা], জেলা: [জেলা], পিন কোড: [পিন কোড]। 

আপনাকে জানাচ্ছি যে, গত [হারানোর তারিখ] তারিখে আনুমানিক [সময়, যেমন: দুপুর ২:৩০ মিনিট] নাগাদ [যে স্থান থেকে রওনা হয়েছিলেন] থেকে [যে স্থানে যাচ্ছিলেন] যাওয়ার পথে আমার [নথির নাম ও নম্বর, যেমন: আধার কার্ড নং: XXXX-XXXX-XXXX] দুর্ভাগ্যবশত হারিয়ে গেছে। অনেক খোঁজাখুঁজি করেও আমি তা উদ্ধার করতে পারিনি।

অতএব, মহাশয়ের নিকট আমার বিনীত প্রার্থনা, উক্ত বিষয়ে একটি সাধারণ ডায়েরি (GD) নথিভুক্ত করে আমাকে একটি প্রাপ্তি রসিদ (GD Copy) প্রদান করিতে আজ্ঞা হয়, যাতে আমি পুনরায় নতুন কার্ডের আবেদন করতে পারি।

ধন্যবাদান্তে,

(স্বাক্ষর)
নাম: [আপনার নাম]
মোবাইল নং: [মোবাইল নম্বর]
তারিখ: [তারিখ]
স্থান: [স্থান]`
  },
  {
    id: 'bank_passbook_atm',
    title: 'Application to Bank for New Passbook / ATM Card',
    titleBengali: 'ব্যাঙ্কে নতুন পাসবই বা এটিএম কার্ড ইস্যু করার আবেদন',
    category: 'bank',
    description: 'Application to Bank Manager for issuing a duplicate passbook or new ATM debit card.',
    englishContent: `To,
The Branch Manager,
[Name of Bank, e.g. State Bank of India],
[Branch Name] Branch,
[District / City].

Subject: Request for issuance of [New Passbook / Duplicate ATM Card].

Respected Sir/Madam,

I hold a Savings Bank Account with your esteemed branch under Account Number: [Your Account Number] and CIF Number: [Your CIF Number].

I regret to inform you that my previous [Passbook / ATM Card] has been [lost / damaged / filled up]. Therefore, I am unable to track my transactions smoothly.

I kindly request you to please issue a new [Passbook / ATM Debit Card] against my above-mentioned account. I am attaching a self-attested photocopy of my Aadhaar Card and PAN Card for verification.

Thanking you.

Yours sincerely,

(Signature)
Name: [Full Name]
Account No: [Account Number]
Mobile No: [Registered Mobile Number]
Date: [DD/MM/YYYY]`,
    bengaliContent: `বরাবর,
শাখা প্রবন্ধক (Branch Manager),
[ব্যাঙ্কের নাম, যেমন: স্টেট ব্যাঙ্ক অফ ইন্ডিয়া],
[শাখার নাম] শাখা,
[জেলা]।

বিষয়: নতুন [পাসবই / এটিএম কার্ড] প্রদান করিবার জন্য আবেদন।

মহাশয়,

বিনীত নিবেদন এই যে, আমি [আপনার নাম], আপনার শাখায় একটি সঞ্চয়ী হিসাবধারী (Savings Account Holder)। আমার ব্যাঙ্ক একাউন্ট নম্বর: [একাউন্ট নম্বর]।

আমি আপনাকে জানাচ্ছি যে, আমার পূর্বের [পাসবইটি শেষ হয়ে গেছে / হারিয়ে গেছে / এটিএম কার্ডটি নষ্ট হয়ে গেছে]। যার ফলে লেনদেন করতে আমার অসুবিধা হচ্ছে।

অতএব, মহাশয়ের নিকট প্রার্থনা, আমার উক্ত একাউন্টের অনুকূলে একটি নতুন [পাসবই / এটিএম কার্ড] প্রদান করিয়া বাধিত করিবেন। আবেদনের সাথে আমার আধার কার্ডের জেরক্স কপি সংযুক্ত করলাম।

ধন্যবাদান্তে,

(স্বাক্ষর)
নাম: [আপনার পুরো নাম]
একাউন্ট নং: [একাউন্ট নম্বর]
মোবাইল নং: [মোবাইল নম্বর]
তারিখ: [তারিখ]`
  },
  {
    id: 'job_application_general',
    title: 'Standard Job / Employment Application Letter',
    titleBengali: 'চাকরির সাধারণ আবেদনপত্র (Job Application)',
    category: 'application',
    description: 'Universal cover letter for office assistant, computer operator, sales, or shop staff roles.',
    englishContent: `To,
The Hiring Manager / Proprietor,
[Company / Organization Name],
[Address / Location].

Subject: Application for the position of [Job Title, e.g. Computer Operator / Office Assistant].

Respected Sir/Madam,

In response to your job opening, I would like to express my keen interest in applying for the position of [Job Title] at your esteemed organization.

I have completed my [Highest Educational Qualification, e.g. Higher Secondary / Graduate] and possess sound proficiency in computer operations, MS Office, internet browsing, and administrative tasks. I am a hardworking, punctual, and disciplined individual capable of handling daily tasks responsibly.

My Curriculum Vitae (CV) and copies of credentials are attached herewith for your kind consideration. I would be grateful for the opportunity to attend an interview.

Thanking you.

Yours faithfully,

(Signature)
Name: [Full Name]
Mobile No: [Mobile Number]
Email: [Email Address]
Address: [Full Address]
Date: [DD/MM/YYYY]`,
    bengaliContent: `বরাবর,
নিয়োগকর্তা মহাশয় / ডিরেক্টর,
[প্রতিষ্ঠানের নাম],
[ঠিকানা]।

বিষয়: [পদের নাম, যেমন: কম্পিউটার অপারেটর / অফিস সহকারী] পদের জন্য আবেদন।

মহাশয়,

সবিনয় নিবেদন এই যে, আপনার প্রতিষ্ঠানে [পদের নাম] পদে কর্মী নিয়োগের বিষয়টি অবগত হয়ে আমি উক্ত পদের জন্য নিজেকে একজন আগ্রহী প্রার্থী হিসেবে আবেদন করছি।

আমি [আপনার শিক্ষাগত যোগ্যতা, যেমন: উচ্চমাধ্যমিক / স্নাতক] পাস করেছি এবং কম্পিউটার পরিচালনায় (MS Office, ডেটা এন্ট্রি ও ইন্টারনেট) দক্ষ। আমি অত্যন্ত নিষ্ঠা ও সততার সঙ্গে দায়িত্ব পালন করতে প্রস্তুত।

আমার জীবনবৃত্তান্ত (CV) এবং প্রয়োজনীয় নথির কপি এই আবেদনের সাথে সংযুক্ত করিলাম। অনুগ্রহপূর্বক আমাকে একটি ইন্টারভিউয়ের সুযোগ প্রদান করিলে কৃতজ্ঞ থাকিব।

ধন্যবাদান্তে,

(স্বাক্ষর)
নাম: [আপনার নাম]
মোবাইল নং: [মোবাইল নম্বর]
ঠিকানা: [আপনার ঠিকানা]
তারিখ: [তারিখ]`
  },
  {
    id: 'school_leave_application',
    title: 'School / College Leave Application',
    titleBengali: 'বিদ্যালয় বা কলেজের ছুটির আবেদনপত্র',
    category: 'application',
    description: 'Application to Headmaster / Principal requesting absence leave due to illness or personal reason.',
    englishContent: `To,
The Headmaster / Principal,
[Name of School / College],
[Address / Location].

Subject: Application for leave of absence.

Respected Sir/Madam,

I am [Student's Name], a student of Class [Class / Grade, e.g. X, Section A, Roll No: XX] of your institution.

I would like to state that I was unable to attend classes from [Start Date] to [End Date] on account of [Reason, e.g. severe viral fever / an urgent family emergency]. A medical certificate / parent note is enclosed herewith.

Therefore, I kindly request you to grant me leave of absence for those [Number of Days] days and excuse my absence.

Thanking you.

Yours obediently,

(Student's Signature)
Name: [Student's Name]
Class: [Class] | Roll No: [Roll Number]
Guardian's Signature: ________________
Date: [DD/MM/YYYY]`,
    bengaliContent: `বরাবর,
মাননীয় প্রধান শিক্ষক মহাশয়,
[বিদ্যালয়ের নাম],
[ঠিকানা]।

বিষয়: অনুপস্থিতির জন্য ছুটির আবেদন।

মহাশয়,

বিনীত নিবেদন এই যে, আমি আপনার বিদ্যালয়ের [শ্রেণী, যেমন: দশম শ্রেণী, বিভাগ: 'ক', রোল নং: ১২] এর একজন নিয়মিত ছাত্র/ছাত্রী।

আমার শারীরিক অসুস্থতার (যেমন: প্রচণ্ড জ্বর) কারণে আমি গত [শুরুর তারিখ] থেকে [শেষের তারিখ] পর্যন্ত বিদ্যালয়ে উপস্থিত হতে পারিনি।

অতএব, মহাশয়ের নিকট বিনীত প্রার্থনা, উক্ত [কত দিন] দিনের অনুপস্থিতি মার্জনা করে আমাকে বাধিত করিবেন।

বিনীত,

আপনার অনুগত ছাত্র/ছাত্রী
নাম: [ছাত্র/ছাত্রীর নাম]
শ্রেণী: [শ্রেণী] | রোল নং: [রোল নম্বর]
অভিভাবকের স্বাক্ষর: ________________
তারিখ: [তারিখ]`
  }
];
