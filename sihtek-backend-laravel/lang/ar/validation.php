<?php

/*
|--------------------------------------------------------------------------
| التحقق من الصحة — العربية
|--------------------------------------------------------------------------
*/

return [
    'required' => 'حقل :attribute مطلوب.',
    'required_if' => 'حقل :attribute مطلوب عندما يكون :other هو :value.',
    'email' => 'يجب أن يكون :attribute بريداً إلكترونياً صحيحاً.',
    'unique' => 'قيمة :attribute مستعملة من قبل.',
    'confirmed' => 'تأكيد :attribute غير مطابق.',
    'min' => [
        'numeric' => 'يجب أن تكون قيمة :attribute على الأقل :min.',
        'string' => 'يجب أن يحتوي :attribute على :min حروف على الأقل.',
        'array' => 'يجب أن يحتوي :attribute على :min عناصر على الأقل.',
    ],
    'max' => [
        'numeric' => 'يجب ألا تتجاوز قيمة :attribute :max.',
        'string' => 'يجب ألا يتجاوز :attribute :max حرفاً.',
        'array' => 'يجب ألا يحتوي :attribute على أكثر من :max عنصر.',
    ],
    'numeric' => 'يجب أن تكون قيمة :attribute رقماً.',
    'integer' => 'يجب أن تكون قيمة :attribute عدداً صحيحاً.',
    'date' => 'يجب أن تكون قيمة :attribute تاريخاً صحيحاً.',
    'date_format' => 'قيمة :attribute لا تطابق الصيغة :format.',
    'after_or_equal' => 'يجب أن يكون :attribute تاريخاً لاحقاً أو مساوياً لـ :date.',
    'in' => 'قيمة :attribute المختارة غير صحيحة.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'regex' => 'صيغة :attribute غير صحيحة.',
    'exists' => 'قيمة :attribute المختارة غير صحيحة.',
    'password' => 'يجب أن تكون كلمة المرور 8 حروف على الأقل وتحتوي على حروف وأرقام.',

    'attributes' => [
        'name' => 'الاسم الكامل',
        'email' => 'البريد الإلكتروني',
        'phone' => 'الهاتف',
        'password' => 'كلمة المرور',
        'role' => 'نوع الحساب',
        'specialty' => 'التخصص',
        'city' => 'المدينة',
        'bio' => 'التعريف',
        'consultation_fee' => 'ثمن الاستشارة',
        'pharmacy_name' => 'اسم الصيدلية',
        'address' => 'العنوان',
        'reason' => 'سبب الزيارة',
        'scheduled_at' => 'موعد الزيارة',
        'consultation_summary' => 'تقرير الاستشارة',
        'doctor_id' => 'الطبيب',
        'patient_id' => 'المريض',
        'pharmacy_id' => 'الصيدلية',
        'appointment_id' => 'الموعد',
        'medications' => 'الأدوية',
        'dosage' => 'الجرعة',
        'duration' => 'المدة',
        'quantity' => 'الكمية',
        'instructions' => 'التعليمات',
        'price' => 'الثمن',
        'stock_qty' => 'الكمية في المخزون',
        'category' => 'الفئة',
        'lines' => 'الأسطر',
        'status' => 'الحالة',
        'date' => 'التاريخ',
        'q' => 'البحث',
    ],
];
