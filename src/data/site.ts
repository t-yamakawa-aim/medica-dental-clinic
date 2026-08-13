// サイト全体で使う基本情報・定数

export const SITE = {
  name: 'メディカデンタルクリニック',
  nameEn: 'MEDICA DENTAL CLINIC',
  description:
    '虫歯・歯周病・矯正・インプラント治療・メンテナンスや審美のお悩みなら、石川県金沢市のメディカデンタルクリニックへ。症状の根本から解決する歯科医院です。妥協のない診察・説明・治療を行います。',
  phone: '076-252-0162',
  phoneHref: 'tel:0762520162',
  address: '石川県金沢市疋田1-33',
  addressFull: '〒921-8021 石川県金沢市疋田1-33',
  mapQuery: encodeURIComponent('石川県金沢市疋田1-33'),
  receptionHours: '9:00〜18:30',
  // Googleカレンダー埋め込み用のカレンダーID
  // 例: 'xxxxxxxxxxxx@group.calendar.google.com'
  // ※ Googleカレンダー側で「予定の公開」設定をONにしてから設定してください
  googleCalendarId: 'c870ed19936b6ff4938157d79506b790c6d8b44ea0c94e794860e9b100ad63c3@group.calendar.google.com',
} as const

// 診療時間テーブル用データ
export type ScheduleRow = {
  time: string
  note?: string
  days: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean; sun: boolean }
}

export const SCHEDULE: ScheduleRow[] = [
  {
    time: '9:00-12:30',
    days: { mon: true, tue: true, wed: true, thu: false, fri: true, sat: true, sun: false },
  },
  {
    time: '14:00-18:30',
    note: '土曜は17:00まで',
    days: { mon: true, tue: true, wed: true, thu: false, fri: true, sat: true, sun: false },
  },
]

// 定休日: 木曜・日曜・祝日
export const CLOSED_WEEKDAYS = [4, 0] // JS: 0=日,1=月,...6=土 → 木=4, 日=0

// グローバルナビゲーション
export type NavItem = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'ホーム',
    href: '/',
    children: [
      { label: '診療カレンダー', href: '/#calendar' },
      { label: 'お知らせ', href: '/#news' },
      { label: 'ブログ', href: '/#blog' },
    ],
  },
  {
    label: '当院について',
    href: '/medical',
    children: [
      { label: '私たちの目指すもの', href: '/medical#vision' },
      { label: '院長紹介', href: '/medical#director' },
      { label: '当院概要', href: '/medical#outline' },
      { label: '施設・設備紹介', href: '/medical#facility' },
      { label: '当院の感染症対策', href: '/medical#hygiene' },
      { label: 'スタッフ紹介', href: '/medical#staff' },
    ],
  },
  {
    label: '診療のご案内',
    href: '/service',
    children: [{ label: '診療の流れ', href: '/service#flow' }],
  },
  {
    label: '症状別で探す',
    href: '/symptoms',
  },
  { label: '採用情報', href: '/recruit' },
  { label: 'アクセス', href: '/#access' },
]

// 症状別リンク（アイコンはFontAwesomeクラス名）
export type SymptomItem = {
  icon: string
  title: string
  titleShort?: string
  slug: string
  href: string
  /** 詳細ページを実装済みかどうか */
  ready?: boolean
}

export const SYMPTOMS: SymptomItem[] = [
  {
    icon: 'fa-solid fa-tooth',
    title: '痛い・しみる・腫れた・血が出た・歯がぐらぐらする',
    slug: 'pain',
    href: '/symptoms/pain',
    ready: true,
  },
  {
    icon: 'fa-solid fa-face-smile',
    title: '審美・歯並び・ホワイトニング',
    slug: 'beauty',
    href: '/symptoms/beauty',
  },
  {
    icon: 'fa-solid fa-teeth-open',
    title: '歯や被せ物が欠けた・取れた',
    slug: 'broken',
    href: '/symptoms/broken',
  },
  {
    icon: 'fa-solid fa-teeth',
    title: '噛み合わせが悪い・歯が無い（少ない）',
    slug: 'bite',
    href: '/symptoms/bite',
  },
  {
    icon: 'fa-solid fa-clipboard-check',
    title: 'メンテナンスを受けたい・お口の状況を知りたい',
    slug: 'maintenance',
    href: '/symptoms/maintenance',
  },
  {
    icon: 'fa-solid fa-comment-medical',
    title: 'その他のお悩み・ご相談',
    slug: 'other',
    href: '/symptoms/other',
  },
]

// ===========================================================
// 「当院について」ページ（/medical）専用データ
// ===========================================================

// 私たちの目指すもの：3つの約束
export type PromiseItem = {
  no: string
  title: string
  body: string
  image: string
}

export const MEDICAL_PROMISES: PromiseItem[] = [
  {
    no: '01',
    title: '妥協のない歯科医療',
    body:
      '患者様にとって最良の医療とは何か。スタッフ一人ひとりが患者様と真剣に向き合います。当院では患者様お一人に十分な時間を掛けて診療を行います（ご予約なしの急患の方や、消毒処置のみの診療などは短時間のご対応となる場合がございます）。治療や予防処置、それらにかかわるご説明に妥協はありません。皆様からのご質問にも、一つひとつ丁寧にお答えいたします。',
    image: '/static/images/facility-01.jpg',
  },
  {
    no: '02',
    title: '知識と技術のアップデート',
    body:
      '幅広い知識と高い技術力を持つ院長が、ドクター、歯科衛生士、スタッフへの技術・サービス面での指導を継続的に行っています。その歯一本ではなく、お口や身体全体を見通した治療の選択肢をご提示します。',
    image: '/static/images/facility-02.jpg',
  },
  {
    no: '03',
    title: '設備へのこだわり',
    body:
      '歯科医療は微細かつ繊細な行為です。当院では検査・診断・治療をより確かなものにするため、最新のCT・レントゲン設備を取り入れています。技術とツールの両面から、患者様にご納得いただける医療をご提供します。',
    image: '/static/images/facility-03.jpg',
  },
]

// 院長紹介
export const DIRECTOR = {
  name: '中村 誠一',
  nameKana: 'なかむら せいいち',
  image: '/static/images/director.jpg',
  greetingTitle: '院長挨拶',
  greetingParagraphs: [
    '皆様はじめまして。メディカデンタルクリニック院長の中村誠一（なかむら せいいち）です。',
    'この度、生まれ育った金沢で歯科医院を開院させていただくこととなりました。地元に歯科医師として戻ってくることができ、嬉しさと同時に医療者として身の引き締まる思いでおります。開院に際し、少々長くなりますが、ご挨拶の場を借りて私の歯科医療への思いを、お話しさせていただきたいと思います。',
    '歯科における「良い治療」とは何か。これまで多くの患者様と向き合ってきたなかで、皆様にお伝えしたい2つの理念があります。',
  ],
  beliefs: [
    {
      title: '1.長続きする治療の実践',
      paragraphs: [
        '歯科医院で行われる治療の多くは、一度治療をした歯の"やり直し"だと言われています。その原因はさまざまですが、なかでも口腔内が清掃しにくい状態で治療が終了してしまうことで、その後の清掃性が保てず歯周病やむし歯が再発してしまったケースが多くみられます。治したはずの歯にまた問題が起きてしまう……歯科医師を信じて手間・時間・お金を掛けてくださった患者様からすれば、こうした結果はご納得いただけるはずがありません。',
        '口腔内の疾患の原因は、主に「細菌」と歯にかかる過度な「力」が影響して引き起こされます。むし歯・歯周病の原因菌の影響により組織に破壊が起きる。また歯に過度な力がかかることにより、歯や、歯の周りの組織の破壊が起きる。それらさまざまな要因が関連し、口腔組織の破壊が進みます。つまり「細菌による炎症（虫歯・歯周病等）」と「力（歯ぎしり・噛み合わせ等）」をいかにコントロールできるかが、病気を防ぐ重要なポイントとなります。ご自身の歯と本当の意味で24時間向き合えるのは患者様ご本人だけです。医院での治療やメンテナンス等の処置が終了した後に、患者様ご自身が「なぜむし歯・歯周病が起きたのか？治療後の対策・予防には何が有効か？」などをご認識いただかなければ、治療後の予防対策も不十分なものとなってしまいます。歯科医師はそうした状況を念頭に、患者様のご来院当初から「わかりやすいご説明」と「清掃しやすい口腔環境をめざした治療」を行う必要があるのです。当院では"処置後の健全な口腔環境が長続きする"安定的な結果を目指し、先を見据えた治療とご説明を行ってまいります。',
      ],
    },
    {
      title: '2.治療の選択肢が患者様の人生をも変えうる',
      paragraphs: [
        '歯学部の学生時代から、私は幅広い分野の治療を行えるようになりたいと考えていました。ただ当時はその理由も、必要な知識や技術、具体的な歯科医師像などもまだ思い描けていませんでした。そうした折、ある研究会で一つの症例発表を目にしました。〈矯正治療〉〈歯周外科〉〈小児歯科〉といった異なる専門分野の深い知識と技術を組み合わせることで可能となる治療方法ですが、通常、一人の歯科医師がこうした分野を並行して習得することは稀です。この症例は私にとって衝撃でした。つまり「どのような治療の選択肢に出会えるか」が、患者様の「人生の分岐」のひとつとなるのです。歯科医師が診療科目を横断した幅広い知識と技術を持って、はじめてご提案できる「治療の選択肢」が増やせるのだと感じました。',
        '今日まで"総合的な治療"にこだわって臨床の場で研鑽を積んできました。生まれ育ったこの地で皆様に歯科の分野で精一杯貢献したいとの思いから開院いたしました。どんな歯科の悩みにも解決の選択肢を示すことができ、最終的な受け皿となり得る歯科医院を目指してまいります。',
      ],
    },
  ],
  signOff: 'メディカデンタルクリニック　院長　中村　誠一',
  career: [
    { year: '2005', text: '石川県金沢市立　小学校・中学校 卒業' },
    { year: '2013', text: '明海大学歯学部 卒業' },
    { year: '2014〜2018', text: '都内歯科医院 勤務（矯正治療 兼務）' },
    { year: '2019〜2022', text: '金沢市内歯科医院 勤務（歯周外科・口腔外科担当）' },
    { year: '2023.4', text: 'メディカデンタルクリニック　開院' },
  ],
  societies: [
    'JIADS（日本先進歯科医療研修施設）：国内最大規模の歯科治療研究機関ならびに臨床医のための研修機関',
    'いいづな総合歯顎研究会：一般歯科診療に矯正治療を取り入れるための研究会、かつ全顎矯正を学ぶための研修会',
    'プルミエ矯正研究会',
  ],
  achievements: [
    'JIADS総会・学術大会 発表',
    'いいづな総合歯顎研究会　優秀発表賞 受賞',
  ],
  courses: {
    jiads: [
      'ペリオコース',
      '補綴コース',
      'エンドコース',
      'インプラントコース',
      'ペリオアドバンスコース',
    ],
    others: [
      '矯正学の過去・現在・未来に関する国際セミナー受講',
      'インプラント時代における"ピュア・ペリオ"集中実習コース',
    ],
  },
}

// 当院概要
export const CLINIC_OUTLINE: { label: string; value: string }[] = [
  { label: '名称', value: 'メディカデンタルクリニック' },
  { label: '設立', value: '2023年4月' },
  { label: '代表者', value: `院長　${DIRECTOR.name}（${DIRECTOR.nameKana}）` },
  {
    label: '所在地',
    value: SITE.addressFull,
  },
  { label: '電話番号', value: '076-252-0162' },
  {
    label: '診療内容',
    value:
      '歯科、小児歯科、矯正歯科、歯科口腔外科、予防歯科、歯周治療、インプラント治療、噛み合わせ治療、入れ歯治療、虫歯治療、審美治療、その他自由診療',
  },
]

// 施設・設備紹介
export type FacilityItem = {
  title: string
  body: string
  image: string
}

export const FACILITY_ROOMS: FacilityItem[] = [
  { title: '受付', body: '院内受付カウンターです。ご来院の際はまずこちらにお寄りください。スタッフが当日の診療についてご確認させていただきます。', image: '/static/images/facility-01.jpg' },
  { title: '待合室', body: '落ち着いた雰囲気の待合室です。スタッフのお声がけまで、こちらでお待ちください。', image: '/static/images/facility-02.jpg' },
  { title: '診察室（半個室）', body: '患者様のプライバシーをお守りできるよう、半個室・個室の診療室・オペ室で治療を受けていただけます。', image: '/static/images/facility-03.jpg' },
  { title: 'キッズスペース', body: 'お子様連れの方もご安心して治療を受けていただけます。', image: '/static/images/exterior.jpg' },
]

export const FACILITY_EQUIPMENTS: FacilityItem[] = [
  { title: '歯科用CT・レントゲン', body: '検査・診断・治療をより確かなものにするため、最新のCT・レントゲン設備を導入しています。', image: '/static/images/facility-01.jpg' },
  { title: 'マイクロスコープ', body: '肉眼の3〜20倍に拡大することができる歯科用顕微鏡です。拡大視野下で、オペや根管治療などの繊細な治療を行います。', image: '/static/images/facility-02.jpg' },
  { title: 'クラスB オートクレーブ', body: '世界最高水準の滅菌機能をもつ高圧蒸気滅菌器です。歯科医療で使用する全ての器具を滅菌できる「クラスB」タイプを導入しています。', image: '/static/images/facility-03.jpg' },
]

// 当院の感染症対策
export const HYGIENE_MEASURES = {
  normal: [
    '治療器具（タービン、ハンドピースなど）の消毒殺菌、高圧滅菌',
    '診療設備（診療台パネル、医療用チェアなど）の消毒',
    '患者様のお使いになる紙コップや診察時のエプロンはすべて使い捨て（ディスポーザブル）',
    '医師やスタッフが使用するグローブはすべて使い捨て',
    '院内の清掃、消毒の徹底',
  ],
  additional: [
    '院内設備（ソファ、机、ドアノブなど）の消毒の徹底',
    '院内の定期的な換気、空気清浄機の導入',
    '治療前後の手指消毒の徹底',
    '全スタッフ毎日の問診と検温の実施',
  ],
}

// スタッフ紹介
export type StaffMember = {
  role: string
  name: string
  image: string
  message: string
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    role: '歯科衛生士',
    name: '吉田（よしだ）',
    image: '/static/images/facility-02.jpg',
    message:
      '患者様とのコミュニケーションを大切にし、一人一人の患者様に合った歯磨きの仕方のご提案、クリーニングの実施を心がけています。何か不安なことやお困りごとがありましたら、ご相談ください。一緒にお口の健康を守っていきましょう！',
  },
]

// フッターナビ
export const FOOTER_NAV = [
  { label: '当院について', href: '/medical' },
  { label: '診療のご案内', href: '/service' },
  { label: '症状別で探す', href: '/symptoms' },
  { label: 'ブログ', href: '/blog' },
  { label: '新着情報', href: '/news' },
  { label: 'お問い合わせ・Web予約', href: '/contact' },
  { label: 'プライバシーポリシー', href: '/privacy' },
]
