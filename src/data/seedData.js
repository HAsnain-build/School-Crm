// Deterministic rich seed data for School ERP Demo (no backend required)

export function createSeedDatabase() {
  const users = [
    {
      id: 'u1',
      name: 'Principal',
      username: 'principal',
      email: 'principal@school.com',
      password: 'demo1234',
      role: 'Owner / Principal',
      phone: '0300-8451122',
    },
  ];

  const classes = [
    { id: 'c0', name: 'Montessori', monthlyFee: 2500 },
    { id: 'c1', name: 'Class 1', monthlyFee: 2500 },
    { id: 'c2', name: 'Class 2', monthlyFee: 2600 },
    { id: 'c3', name: 'Class 3', monthlyFee: 2700 },
    { id: 'c4', name: 'Class 4', monthlyFee: 2800 },
    { id: 'c5', name: 'Class 5', monthlyFee: 3000 },
    { id: 'c6', name: 'Class 6', monthlyFee: 3200 },
    { id: 'c7', name: 'Class 7', monthlyFee: 3400 },
    { id: 'c8', name: 'Class 8', monthlyFee: 3600 },
    { id: 'c9', name: 'Class 9', monthlyFee: 4000 },
    { id: 'c10', name: 'Class 10', monthlyFee: 4500 },
  ];

  const firstNames = [
    'Ayesha', 'Muhammad', 'Sara', 'Hamza', 'Usman', 'Areeba', 'Danish', 'Zainab',
    'Bilal', 'Hira', 'Hassan', 'Fatima', 'Umer', 'Sana', 'Ali', 'Mariam',
    'Saad', 'Noor', 'Taha', 'Khadija', 'Ahmed', 'Laiba', 'Rayyan', 'Mahnoor',
    'Ibrahim', 'Esha', 'Huzaifa', 'Amna', 'Faizan', 'Zoya',
  ];

  const lastNames = [
    'Khan', 'Ali', 'Ahmed', 'Raza', 'Fatima', 'Malik', 'Qureshi', 'Siddiqui',
    'Butt', 'Sheikh', 'Chaudhry', 'Tariq', 'Iqbal', 'Farooq', 'Bhatti', 'Hassan',
  ];

  const fatherNames = [
    'Tariq Mahmood', 'Muhammad Aslam', 'Kamran Ahmed', 'Raza Hussain', 'Nadeem Malik',
    'Rashid Khan', 'Sajid Qureshi', 'Imran Siddiqui', 'Shahid Butt', 'Khalid Sheikh',
    'Zahid Chaudhry', 'Arshad Iqbal', 'Waseem Farooq', 'Javed Bhatti', 'Faisal Hassan',
    'Salman Akhtar', 'Azhar Iqbal', 'Naveed Anjum', 'Tahir Mehmood', 'Nasir Ali',
    'Akramullah Khan', 'Babar Munir', 'Sohail Zafar', 'Rizwan Gill', 'Farhan Ashraf',
    'Zubair Dar', 'Irfan Abbasi', 'Ejaz Mirza', 'Shafiq Awan', 'Mujahid Raza',
  ];

  // Deterministic distribution totaling 120 students across Montessori - Class 10
  const classCounts = [12, 11, 11, 13, 12, 11, 10, 10, 10, 10, 10];
  const students = [];
  let sIdx = 1;

  // Named featured students matching the UI reference at top positions
  const featuredStudents = [
    { name: 'Ayesha Khan', fatherName: 'Tariq Khan', classId: 'c5', phone: '0300-4112233', familyNo: 'FAM-101', status: 'Active' },
    { name: 'Muhammad Ali', fatherName: 'Aslam Raza', classId: 'c3', phone: '0321-5113344', familyNo: 'FAM-102', status: 'Active' },
    { name: 'Sara Ahmed', fatherName: 'Kamran Ahmed', classId: 'c8', phone: '0333-6114455', familyNo: 'FAM-103', status: 'Active' },
    { name: 'Hamza Khan', fatherName: 'Tariq Khan', classId: 'c1', phone: '0300-4112233', familyNo: 'FAM-101', status: 'Active' },
    { name: 'Usman Raza', fatherName: 'Raza Hussain', classId: 'c7', phone: '0301-7115566', familyNo: 'FAM-104', status: 'Active' },
    { name: 'Areeba Fatima', fatherName: 'Nadeem Malik', classId: 'c6', phone: '0345-8116677', familyNo: 'FAM-105', status: 'Active' },
    { name: 'Danish Khan', fatherName: 'Rashid Khan', classId: 'c9', phone: '0312-9117788', familyNo: 'FAM-106', status: 'Active' },
  ];

  for (const fs of featuredStudents) {
    const cls = classes.find((c) => c.id === fs.classId);
    const num = String(sIdx).padStart(4, '0');
    students.push({
      id: `s${sIdx}`,
      name: fs.name,
      fatherName: fs.fatherName,
      classId: fs.classId,
      phone: fs.phone,
      familyNo: fs.familyNo,
      admissionDate: `2024-04-${String((sIdx % 20) + 5).padStart(2, '0')}`,
      bForm: `35202-${String(1000000 + sIdx * 137).slice(0, 7)}-${(sIdx % 9) + 1}`,
      status: fs.status,
      monthlyFee: cls.monthlyFee,
    });
    sIdx += 1;
  }

  for (let cIndex = 0; cIndex < classes.length; cIndex++) {
    const cls = classes[cIndex];
    const existingInClass = students.filter((s) => s.classId === cls.id).length;
    const needed = classCounts[cIndex] - existingInClass;
    for (let k = 0; k < needed; k++) {
      const fName = firstNames[(sIdx * 3 + k) % firstNames.length];
      const lName = lastNames[(sIdx * 5 + cIndex) % lastNames.length];
      const father = fatherNames[(sIdx + k * 2) % fatherNames.length];
      // Share family numbers periodically so siblings appear naturally
      const familyNum = 107 + Math.floor((sIdx - 8) / 1.4);
      const isInactive = sIdx % 19 === 0; // ~6 inactive students out of 120
      const prefix = ['0300', '0321', '0333', '0301', '0345', '0312'][sIdx % 6];
      const pBody = String(2100000 + sIdx * 4321).slice(0, 7);

      students.push({
        id: `s${sIdx}`,
        name: `${fName} ${lName}`,
        fatherName: father,
        classId: cls.id,
        phone: `${prefix}-${pBody}`,
        familyNo: `FAM-${familyNum}`,
        admissionDate: `202${3 + (sIdx % 3)}-${String(((sIdx % 9) + 1)).padStart(2, '0')}-${String(((sIdx % 22) + 4)).padStart(2, '0')}`,
        bForm: `35202-${String(2000000 + sIdx * 271).slice(0, 7)}-${(sIdx % 9) + 1}`,
        status: isInactive ? 'Inactive' : 'Active',
        monthlyFee: cls.monthlyFee,
      });
      sIdx += 1;
    }
  }

  // 15 Teachers
  const teacherProfiles = [
    { name: 'Prof. Abdul Rehman', father: 'Ghulam Nabi', qual: 'M.Sc Mathematics', sub: 'Class 9 & 10 Math', salary: 38000 },
    { name: 'Miss Sana Tariq', father: 'Tariq Aziz', qual: 'M.A English', sub: 'English (6-10)', salary: 32000 },
    { name: 'Sir Waqas Ahmed', father: 'Bashir Ahmed', qual: 'M.Sc Physics', sub: 'Physics & Science', salary: 35000 },
    { name: 'Miss Bushra Saleem', father: 'Saleem Akhtar', qual: 'B.Ed / Montessori', sub: 'Montessori Incharge', salary: 26000 },
    { name: 'Sir Kamran Yousaf', father: 'Yousaf Ali', qual: 'BSCS', sub: 'Computer Science', salary: 30000 },
    { name: 'Miss Sadia Iqbal', father: 'Iqbal Hussain', qual: 'M.A Urdu', sub: 'Urdu & Islamiat', salary: 28000 },
    { name: 'Sir Faisal Nadeem', father: 'Nadeem Ashraf', qual: 'M.Sc Chemistry', sub: 'Chemistry & Bio', salary: 34000 },
    { name: 'Miss Amna Khalid', father: 'Khalid Mehmood', qual: 'B.A / B.Ed', sub: 'Class 1 & 2', salary: 24000 },
    { name: 'Miss Hina Farooq', father: 'Farooq Dar', qual: 'M.A Education', sub: 'Class 3 & 4', salary: 25000 },
    { name: 'Sir Bilal Qureshi', father: 'Akram Qureshi', qual: 'M.A Islamiat', sub: 'Islamiat & Nazra', salary: 26000 },
    { name: 'Miss Nimra Hassan', father: 'Hassan Raza', qual: 'BS Mathematics', sub: 'Middle School Math', salary: 29000 },
    { name: 'Sir Salman Siddiqui', father: 'Noman Siddiqui', qual: 'M.A Pak Studies', sub: 'Social Studies', salary: 27000 },
    { name: 'Miss Iqra Javed', father: 'Javed Iqbal', qual: 'B.Sc', sub: 'Class 5 General', salary: 25000 },
    { name: 'Miss Zainab Mansoor', father: 'Mansoor Ali', qual: 'B.Ed', sub: 'Montessori Assistant', salary: 21000 },
    { name: 'Sir Umair Latif', father: 'Latif Chaudhry', qual: 'D.P.Ed', sub: 'PT & Sports', salary: 22000 },
  ];

  const teachers = teacherProfiles.map((tp, idx) => ({
    id: `t${idx + 1}`,
    name: tp.name,
    fatherName: tp.father,
    cnic: `35201-${String(4100000 + idx * 12345).slice(0, 7)}-${(idx % 9) + 1}`,
    phone: `030${idx % 9}-${String(5200000 + idx * 9871).slice(0, 7)}`,
    qualification: tp.qual,
    subjectClass: tp.sub,
    joiningDate: `202${1 + (idx % 4)}-0${(idx % 8) + 1}-05`,
    salary: tp.salary,
    status: idx === 14 ? 'Inactive' : 'Active',
  }));

  // 3 Months: 2026-09, 2026-10, 2026-11
  const months = ['2026-09', '2026-10', '2026-11'];
  const vouchers = [];
  const receipts = [];
  let vSeq = 1;
  let rSeq = 1;

  const activeStudents = students.filter((s) => s.status === 'Active');

  for (const month of months) {
    const ymCompact = month.replace('-', '');
    const dueDate = `${month}-10`;

    activeStudents.forEach((stu, idx) => {
      const vId = `v_${ymCompact}_${stu.id}`;
      const voucherNo = `V-${ymCompact}-${String(vSeq).padStart(4, '0')}`;
      vSeq += 1;

      const tuition = stu.monthlyFee;
      let arrears = 0;
      // Check previous month unpaid balance for realistic arrears carry-forward
      if (month === '2026-11') {
        const prev = vouchers.find((v) => v.studentId === stu.id && v.month === '2026-10');
        if (prev && prev.net - prev.paid > 0) {
          arrears = prev.net - prev.paid;
        }
      }

      let status = 'Paid';
      let lateFee = 0;
      let waiver = 0;
      let waiverReason = '';

      if (month === '2026-09') {
        // Mostly paid in Sept
        status = idx > 4 && idx % 28 === 0 ? 'Unpaid' : 'Paid';
      } else if (month === '2026-10') {
        if (stu.id === 's5' || stu.id === 's7' || (idx > 4 && idx % 14 === 0)) {
          status = 'Unpaid';
          lateFee = 200;
        } else if (idx > 4 && idx % 17 === 0) {
          status = 'Partial';
        }
      } else if (month === '2026-11') {
        // Featured defaulters in Nov: Usman Raza (s5), Areeba Fatima (s6), Danish Khan (s7) + ~20% others
        if (['s5', 's6', 's7'].includes(stu.id) || (idx > 4 && idx % 5 === 4)) {
          status = 'Unpaid';
          lateFee = 200;
        } else if (idx > 4 && idx % 9 === 5) {
          status = 'Partial';
          lateFee = 200;
        } else if (idx > 4 && idx % 12 === 2) {
          waiver = 500;
          waiverReason = 'Sibling discount';
        }
      }

      const net = Math.max(0, tuition + arrears + lateFee - waiver);
      let paid = 0;
      if (status === 'Paid') paid = net;
      else if (status === 'Partial') paid = Math.round(net * 0.5);

      vouchers.push({
        id: vId,
        voucherNo,
        studentId: stu.id,
        month,
        dueDate,
        tuition,
        arrears,
        lateFee,
        waiver,
        waiverReason,
        net,
        paid,
        status,
      });

      if (paid > 0) {
        const dayNum = Math.min(24, 5 + (idx % 19));
        const rDate = `${month}-${String(dayNum).padStart(2, '0')}`;
        receipts.push({
          id: `r_${ymCompact}_${stu.id}`,
          receiptNo: `R-${ymCompact}-${String(rSeq).padStart(4, '0')}`,
          voucherId: vId,
          studentId: stu.id,
          amount: paid,
          method: idx % 4 === 0 ? 'Bank' : 'Cash',
          date: rDate,
        });
        rSeq += 1;
      }
    });
  }

  // Ensure the 4 featured recent receipts appear cleanly at the latest dates in 2026-11
  const featuredReceiptAdjustments = [
    { studentId: 's1', date: '2026-11-23' },
    { studentId: 's2', date: '2026-11-22' },
    { studentId: 's3', date: '2026-11-21' },
    { studentId: 's4', date: '2026-11-20' },
  ];
  for (const adj of featuredReceiptAdjustments) {
    const rec = receipts.find((r) => r.studentId === adj.studentId && r.date.startsWith('2026-11'));
    if (rec) rec.date = adj.date;
  }

  // Salary Records across 3 months
  const salaryRecords = [];
  const activeTeachers = teachers.filter((t) => t.status === 'Active');
  for (const month of months) {
    activeTeachers.forEach((t, idx) => {
      const isPaid = month !== '2026-11' || idx < 10; // In Nov, 10 paid, 4 pending
      const deduction = idx === 3 && month === '2026-11' ? 1000 : 0;
      const net = t.salary - deduction;
      salaryRecords.push({
        id: `sal_${month.replace('-', '')}_${t.id}`,
        teacherId: t.id,
        month,
        basic: t.salary,
        deduction,
        net,
        status: isPaid ? 'Paid' : 'Pending',
        paidDate: isPaid ? `${month}-0${Math.min(9, (idx % 7) + 2)}` : '',
        method: isPaid ? (idx % 3 === 0 ? 'Bank' : 'Cash') : '',
      });
    });
  }

  // Expense Categories
  const expenseCategories = [
    { id: 'ec1', name: 'Electricity' },
    { id: 'ec2', name: 'Rent' },
    { id: 'ec3', name: 'Stationery' },
    { id: 'ec4', name: 'Water / Gas' },
    { id: 'ec5', name: 'Maintenance' },
    { id: 'ec6', name: 'Cleaning' },
    { id: 'ec7', name: 'Stock Purchase' },
    { id: 'ec8', name: 'Internet / Phone' },
  ];

  // 30 Expenses across 3 months
  const expenses = [
    { id: 'ex1', date: '2026-11-23', categoryId: 'ec1', payee: 'LESCO / WAPDA', amount: 5500, note: 'Electricity Bill November' },
    { id: 'ex2', date: '2026-11-20', categoryId: 'ec3', payee: 'Urdu Bazar Book Depot', amount: 3200, note: 'Stationery & Registers' },
    { id: 'ex3', date: '2026-11-18', categoryId: 'ec5', payee: 'Akram Electrician', amount: 4000, note: 'Repair Work (Fans & Lights)' },
    { id: 'ex4', date: '2026-11-15', categoryId: 'ec7', payee: 'Ilmi Kitab Ghar', amount: 6000, note: 'Library Books Purchase' },
    { id: 'ex5', date: '2026-11-12', categoryId: 'ec2', payee: 'Haji Bashir Landlord', amount: 25000, note: 'Monthly Building Rent' },
    { id: 'ex6', date: '2026-11-10', categoryId: 'ec8', payee: 'PTCL Fiber', amount: 3500, note: 'School Internet & Landline' },
    { id: 'ex7', date: '2026-11-08', categoryId: 'ec6', payee: 'Rashid Janitorial', amount: 2800, note: 'Cleaning Supplies & Phenyl' },
    { id: 'ex8', date: '2026-11-06', categoryId: 'ec4', payee: 'WASA & Sui Gas', amount: 2400, note: 'Water & Gas Utility Bill' },
    { id: 'ex9', date: '2026-11-04', categoryId: 'ec3', payee: 'Al-Noor Printers', amount: 4500, note: 'Fee Voucher Books Printing' },
    { id: 'ex10', date: '2026-11-02', categoryId: 'ec5', payee: 'Tariq Plumber', amount: 1800, note: 'Washroom Tap Replacement' },
    // October 2026
    { id: 'ex11', date: '2026-10-25', categoryId: 'ec1', payee: 'LESCO / WAPDA', amount: 6200, note: 'Electricity Bill October' },
    { id: 'ex12', date: '2026-10-22', categoryId: 'ec7', payee: 'Standard Uniforms', amount: 9500, note: 'Winter Uniform Stock' },
    { id: 'ex13', date: '2026-10-19', categoryId: 'ec3', payee: 'Urdu Bazar Book Depot', amount: 2900, note: 'Whiteboard Markers & Chalk' },
    { id: 'ex14', date: '2026-10-15', categoryId: 'ec2', payee: 'Haji Bashir Landlord', amount: 25000, note: 'October Building Rent' },
    { id: 'ex15', date: '2026-10-12', categoryId: 'ec8', payee: 'PTCL Fiber', amount: 3500, note: 'Internet Bill' },
    { id: 'ex16', date: '2026-10-10', categoryId: 'ec4', payee: 'WASA & Sui Gas', amount: 2100, note: 'Water & Gas Bill' },
    { id: 'ex17', date: '2026-10-08', categoryId: 'ec6', payee: 'Rashid Janitorial', amount: 2500, note: 'Detergents & Brooms' },
    { id: 'ex18', date: '2026-10-05', categoryId: 'ec5', payee: 'Noor Carpenter', amount: 5200, note: 'Desks & Benches Repair' },
    { id: 'ex19', date: '2026-10-03', categoryId: 'ec3', payee: 'Fine Stationers', amount: 1900, note: 'A4 Paper Reams' },
    { id: 'ex20', date: '2026-10-01', categoryId: 'ec7', payee: 'Ilmi Kitab Ghar', amount: 4800, note: 'Montessori Flashcards' },
    // September 2026
    { id: 'ex21', date: '2026-09-26', categoryId: 'ec1', payee: 'LESCO / WAPDA', amount: 7400, note: 'Electricity Bill September' },
    { id: 'ex22', date: '2026-09-21', categoryId: 'ec2', payee: 'Haji Bashir Landlord', amount: 25000, note: 'September Building Rent' },
    { id: 'ex23', date: '2026-09-18', categoryId: 'ec3', payee: 'Urdu Bazar Book Depot', amount: 4100, note: 'Attendance & Cash Registers' },
    { id: 'ex24', date: '2026-09-15', categoryId: 'ec7', payee: 'Standard Uniforms', amount: 8000, note: 'School Badges & Ties' },
    { id: 'ex25', date: '2026-09-12', categoryId: 'ec8', payee: 'PTCL Fiber', amount: 3500, note: 'Internet & Phone' },
    { id: 'ex26', date: '2026-09-10', categoryId: 'ec4', payee: 'WASA & Sui Gas', amount: 2200, note: 'Water & Gas Bill' },
    { id: 'ex27', date: '2026-09-07', categoryId: 'ec6', payee: 'Rashid Janitorial', amount: 2600, note: 'Cleaning Supplies' },
    { id: 'ex28', date: '2026-09-05', categoryId: 'ec5', payee: 'Bilal Painter', amount: 6500, note: 'Classroom Whitewash' },
    { id: 'ex29', date: '2026-09-03', categoryId: 'ec3', payee: 'Al-Noor Printers', amount: 3000, note: 'Admission Forms' },
    { id: 'ex30', date: '2026-09-01', categoryId: 'ec7', payee: 'Ilmi Kitab Ghar', amount: 5500, note: 'Science Charts & Globes' },
  ];

  // 25 Stock Items across Library, Uniform, Other
  const stockItems = [
    { id: 'st1', group: 'Library', name: 'Oxford English Reader (Class 1-5)', quantity: 42, updatedAt: '2026-11-15' },
    { id: 'st2', group: 'Library', name: 'Urdu Story Books', quantity: 35, updatedAt: '2026-11-15' },
    { id: 'st3', group: 'Library', name: 'Science Encyclopedia Set', quantity: 4, updatedAt: '2026-11-10' },
    { id: 'st4', group: 'Library', name: 'Islamiat & Seerat Books', quantity: 28, updatedAt: '2026-11-08' },
    { id: 'st5', group: 'Library', name: 'General Knowledge Atlas', quantity: 14, updatedAt: '2026-11-05' },
    { id: 'st6', group: 'Library', name: 'Montessori Picture Books', quantity: 3, updatedAt: '2026-11-02' },
    { id: 'st7', group: 'Library', name: 'Math Practice Workbooks', quantity: 50, updatedAt: '2026-10-28' },
    { id: 'st8', group: 'Library', name: 'English-Urdu Dictionary', quantity: 12, updatedAt: '2026-10-20' },
    { id: 'st9', group: 'Library', name: 'Matric Past Papers Bundle', quantity: 22, updatedAt: '2026-10-15' },
    // Uniform
    { id: 'st10', group: 'Uniform', name: 'Boys Summer Shirt (Small)', quantity: 25, updatedAt: '2026-11-12' },
    { id: 'st11', group: 'Uniform', name: 'Boys Summer Shirt (Medium)', quantity: 18, updatedAt: '2026-11-12' },
    { id: 'st12', group: 'Uniform', name: 'Boys Navy Trouser (All Sizes)', quantity: 30, updatedAt: '2026-11-10' },
    { id: 'st13', group: 'Uniform', name: 'Girls Uniform Suit (Primary)', quantity: 20, updatedAt: '2026-11-09' },
    { id: 'st14', group: 'Uniform', name: 'Girls Uniform Suit (High)', quantity: 4, updatedAt: '2026-11-04' },
    { id: 'st15', group: 'Uniform', name: 'School Tie & Monogram Badge', quantity: 65, updatedAt: '2026-10-22' },
    { id: 'st16', group: 'Uniform', name: 'Winter Navy Sweater (Small)', quantity: 15, updatedAt: '2026-10-22' },
    { id: 'st17', group: 'Uniform', name: 'Winter Navy Sweater (Large)', quantity: 2, updatedAt: '2026-10-22' },
    { id: 'st18', group: 'Uniform', name: 'PT White Tracksuit', quantity: 16, updatedAt: '2026-10-11' },
    // Other
    { id: 'st19', group: 'Other', name: 'Whiteboard Markers (Box)', quantity: 11, updatedAt: '2026-11-18' },
    { id: 'st20', group: 'Other', name: 'Dusters & Chalk Boxes', quantity: 19, updatedAt: '2026-11-16' },
    { id: 'st21', group: 'Other', name: 'A4 Printing Paper Ream', quantity: 3, updatedAt: '2026-11-14' },
    { id: 'st22', group: 'Other', name: 'Attendance Registers', quantity: 24, updatedAt: '2026-10-25' },
    { id: 'st23', group: 'Other', name: 'Fee Voucher Books (Blank)', quantity: 14, updatedAt: '2026-11-04' },
    { id: 'st24', group: 'Other', name: 'First Aid Kit Refills', quantity: 4, updatedAt: '2026-10-19' },
    { id: 'st25', group: 'Other', name: 'Cricket & Football Sports Kit', quantity: 7, updatedAt: '2026-09-29' },
  ];

  const stockGroups = ['Library', 'Uniform', 'Other'];

  const settings = {
    schoolName: 'ABC Public School',
    address: 'Main Gulberg Road, Lahore',
    phone: '042-35761234',
    dueDay: 10,
    lateFeeType: 'fixed',
    lateFeeAmount: 200,
    lateFeeMax: 500,
    whatsappTemplate:
      'Dear {father_name}, fee for {student_name} (Class {class}) for {month} is Rs. {amount} pending. Please pay by {due_date}. Thank you.',
  };

  const reminderLogs = [
    { id: 'rl1', studentId: 's5', month: '2026-11', sentAt: '2026-11-18T10:15:00' },
  ];

  return {
    users,
    classes,
    students,
    teachers,
    vouchers,
    receipts,
    salaryRecords,
    expenseCategories,
    expenses,
    stockGroups,
    stockItems,
    settings,
    reminderLogs,
  };
}
