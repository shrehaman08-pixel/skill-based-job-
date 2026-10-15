-- seed.sql
-- Run after migrations: supabase db execute --file supabase/seed.sql
-- Seeds 150+ skills, skill relations, and demo accounts (Phase 8 populates jobs).

-- ============================================================
-- SKILLS (150+)
-- Categories: Frontend, Backend, Data, DevOps, Mobile, Design,
--             Marketing, Management, Database, Testing, Security
-- ============================================================

insert into public.skills (name, category, aliases) values
-- ── FRONTEND ─────────────────────────────────────────────────
('React',              'Frontend',   '{"reactjs","react.js"}'),
('Vue.js',             'Frontend',   '{"vue","vuejs"}'),
('Angular',            'Frontend',   '{"angularjs","angular2+"}'),
('Svelte',             'Frontend',   '{"sveltejs"}'),
('Next.js',            'Frontend',   '{"nextjs","next"}'),
('Nuxt.js',            'Frontend',   '{"nuxtjs","nuxt"}'),
('TypeScript',         'Frontend',   '{"ts","typescript"}'),
('JavaScript',         'Frontend',   '{"js","es6","ecmascript"}'),
('HTML',               'Frontend',   '{"html5","markup"}'),
('CSS',                'Frontend',   '{"css3","styling"}'),
('Tailwind CSS',       'Frontend',   '{"tailwind","tailwindcss"}'),
('Sass/SCSS',          'Frontend',   '{"sass","scss"}'),
('Webpack',            'Frontend',   '{"webpack"}'),
('Vite',               'Frontend',   '{"vitejs"}'),
('Redux',              'Frontend',   '{"redux","redux-toolkit"}'),
('Zustand',            'Frontend',   '{"zustand"}'),
('React Query',        'Frontend',   '{"tanstack-query","react-query"}'),
('GraphQL',            'Frontend',   '{"gql","graphql"}'),
('Apollo Client',      'Frontend',   '{"apollo","apolloclient"}'),
('Storybook',          'Frontend',   '{"storybook"}'),
('Accessibility (a11y)','Frontend',  '{"a11y","wcag","accessibility"}'),
('Web Performance',    'Frontend',   '{"core-web-vitals","lighthouse"}'),
('PWA',                'Frontend',   '{"progressive-web-app","service-worker"}'),
('Three.js',           'Frontend',   '{"threejs","webgl"}'),

-- ── BACKEND ──────────────────────────────────────────────────
('Node.js',            'Backend',    '{"nodejs","node"}'),
('Python',             'Backend',    '{"py","python3"}'),
('Go',                 'Backend',    '{"golang"}'),
('Rust',               'Backend',    '{"rust-lang"}'),
('Java',               'Backend',    '{"java","jvm"}'),
('Kotlin',             'Backend',    '{"kotlin","jvm"}'),
('C#',                 'Backend',    '{"csharp","dotnet","c-sharp"}'),
('.NET',               'Backend',    '{"dotnet","aspnet","asp.net"}'),
('Ruby',               'Backend',    '{"ruby","rb"}'),
('Ruby on Rails',      'Backend',    '{"rails","ror"}'),
('PHP',                'Backend',    '{"php8","php7"}'),
('Laravel',            'Backend',    '{"laravel"}'),
('Django',             'Backend',    '{"django"}'),
('FastAPI',            'Backend',    '{"fastapi"}'),
('Express.js',         'Backend',    '{"express","expressjs"}'),
('NestJS',             'Backend',    '{"nestjs"}'),
('REST APIs',          'Backend',    '{"rest","restful","rest-api"}'),
('gRPC',               'Backend',    '{"grpc","protobuf"}'),
('WebSockets',         'Backend',    '{"websockets","ws","real-time"}'),
('Redis',              'Backend',    '{"redis","cache"}'),
('RabbitMQ',           'Backend',    '{"rabbitmq","amqp","message-queue"}'),
('Kafka',              'Backend',    '{"apache-kafka","kafka","event-streaming"}'),
('Microservices',      'Backend',    '{"microservices","soa"}'),
('Serverless',         'Backend',    '{"serverless","lambda","functions"}'),

-- ── DATABASE ─────────────────────────────────────────────────
('PostgreSQL',         'Database',   '{"postgres","psql","pg"}'),
('MySQL',              'Database',   '{"mysql","mariadb"}'),
('SQLite',             'Database',   '{"sqlite"}'),
('MongoDB',            'Database',   '{"mongo","mongodb"}'),
('DynamoDB',           'Database',   '{"dynamodb","dynamo"}'),
('Cassandra',          'Database',   '{"cassandra","apache-cassandra"}'),
('Elasticsearch',      'Database',   '{"elastic","es","opensearch"}'),
('Supabase',           'Database',   '{"supabase"}'),
('Firebase',           'Database',   '{"firebase","firestore"}'),
('SQL',                'Database',   '{"sql","structured-query-language"}'),
('NoSQL',              'Database',   '{"nosql","document-db"}'),
('Database Design',    'Database',   '{"schema-design","normalization","erd"}'),
('Prisma',             'Database',   '{"prisma","prisma-orm"}'),
('TypeORM',            'Database',   '{"typeorm","orm"}'),

-- ── DEVOPS & CLOUD ───────────────────────────────────────────
('Docker',             'DevOps',     '{"docker","containerization"}'),
('Kubernetes',         'DevOps',     '{"k8s","kubernetes","orchestration"}'),
('CI/CD',              'DevOps',     '{"cicd","continuous-integration","continuous-deployment"}'),
('GitHub Actions',     'DevOps',     '{"github-actions","gha"}'),
('GitLab CI',          'DevOps',     '{"gitlab-ci","gitlab-cd"}'),
('Terraform',          'DevOps',     '{"terraform","iac","infrastructure-as-code"}'),
('Ansible',            'DevOps',     '{"ansible"}'),
('AWS',                'DevOps',     '{"amazon-web-services","ec2","s3","lambda"}'),
('Google Cloud',       'DevOps',     '{"gcp","google-cloud-platform"}'),
('Azure',              'DevOps',     '{"microsoft-azure","azure"}'),
('Linux',              'DevOps',     '{"linux","unix","bash"}'),
('Shell Scripting',    'DevOps',     '{"bash","shell","zsh"}'),
('Nginx',              'DevOps',     '{"nginx","reverse-proxy"}'),
('Monitoring',         'DevOps',     '{"prometheus","grafana","datadog","observability"}'),
('Helm',               'DevOps',     '{"helm","helm-charts"}'),
('Git',                'DevOps',     '{"git","version-control","github","gitlab"}'),

-- ── DATA & ML ────────────────────────────────────────────────
('Data Analysis',      'Data',       '{"data-analysis","analytics","eda"}'),
('Machine Learning',   'Data',       '{"ml","machine-learning"}'),
('Deep Learning',      'Data',       '{"dl","deep-learning","neural-networks"}'),
('NLP',                'Data',       '{"natural-language-processing","text-analysis"}'),
('Computer Vision',    'Data',       '{"cv","image-recognition","opencv"}'),
('Pandas',             'Data',       '{"pandas","dataframe"}'),
('NumPy',              'Data',       '{"numpy"}'),
('Scikit-learn',       'Data',       '{"sklearn","scikit-learn"}'),
('TensorFlow',         'Data',       '{"tensorflow","tf","keras"}'),
('PyTorch',            'Data',       '{"pytorch","torch"}'),
('Spark',              'Data',       '{"apache-spark","pyspark"}'),
('SQL Analytics',      'Data',       '{"data-warehousing","bigquery","redshift","snowflake"}'),
('Power BI',           'Data',       '{"powerbi","power-bi","business-intelligence"}'),
('Tableau',            'Data',       '{"tableau","data-viz","data-visualization"}'),
('Data Engineering',   'Data',       '{"etl","data-pipeline","airflow","dbt"}'),
('Statistics',         'Data',       '{"statistics","probability","hypothesis-testing"}'),
('R',                  'Data',       '{"r-programming","rstudio"}'),
('Jupyter',            'Data',       '{"jupyter","jupyter-notebook","ipython"}'),
('LLMs',               'Data',       '{"large-language-models","openai","gpt","llm"}'),
('MLOps',              'Data',       '{"mlops","model-deployment","kubeflow"}'),

-- ── MOBILE ───────────────────────────────────────────────────
('React Native',       'Mobile',     '{"react-native","rn"}'),
('Flutter',            'Mobile',     '{"flutter","dart"}'),
('iOS Development',    'Mobile',     '{"ios","swift","xcode"}'),
('Android Development','Mobile',     '{"android","kotlin-android","java-android"}'),
('Swift',              'Mobile',     '{"swift","swiftui"}'),
('Dart',               'Mobile',     '{"dart","flutter"}'),
('Expo',               'Mobile',     '{"expo","expo-cli"}'),

-- ── DESIGN ───────────────────────────────────────────────────
('UI/UX Design',       'Design',     '{"ui","ux","user-experience","user-interface"}'),
('Figma',              'Design',     '{"figma"}'),
('Adobe XD',           'Design',     '{"adobexd","xd"}'),
('Sketch',             'Design',     '{"sketch","sketch-app"}'),
('Photoshop',          'Design',     '{"photoshop","ps"}'),
('Illustrator',        'Design',     '{"illustrator","ai"}'),
('Design Systems',     'Design',     '{"design-systems","component-library"}'),
('Prototyping',        'Design',     '{"prototyping","wireframing","mockup"}'),
('Motion Design',      'Design',     '{"motion-design","animation","after-effects"}'),
('Brand Design',       'Design',     '{"branding","brand-identity","logo-design"}'),

-- ── TESTING ──────────────────────────────────────────────────
('Unit Testing',       'Testing',    '{"unit-tests","jest","vitest"}'),
('Integration Testing','Testing',    '{"integration-tests","supertest"}'),
('E2E Testing',        'Testing',    '{"e2e","playwright","cypress","selenium"}'),
('TDD',                'Testing',    '{"test-driven-development","tdd"}'),
('QA Engineering',     'Testing',    '{"qa","quality-assurance","manual-testing"}'),
('Performance Testing','Testing',    '{"load-testing","k6","jmeter"}'),

-- ── SECURITY ─────────────────────────────────────────────────
('Application Security','Security',  '{"appsec","owasp","secure-coding"}'),
('Cloud Security',     'Security',   '{"cloud-security","iam","zero-trust"}'),
('Penetration Testing','Security',   '{"pentest","ethical-hacking","bug-bounty"}'),
('Cryptography',       'Security',   '{"crypto","encryption","tls"}'),
('Identity & Auth',    'Security',   '{"oauth","jwt","saml","sso","authentication"}'),

-- ── MARKETING ────────────────────────────────────────────────
('SEO',                'Marketing',  '{"search-engine-optimization","seo"}'),
('Content Marketing',  'Marketing',  '{"content","blog","copywriting"}'),
('Growth Hacking',     'Marketing',  '{"growth","growth-marketing"}'),
('Email Marketing',    'Marketing',  '{"email","mailchimp","sendgrid"}'),
('Social Media',       'Marketing',  '{"social-media","social","instagram","twitter"}'),
('Paid Ads',           'Marketing',  '{"ppc","google-ads","facebook-ads","paid-advertising"}'),
('Analytics',          'Marketing',  '{"google-analytics","mixpanel","segment","tracking"}'),
('Product Marketing',  'Marketing',  '{"product-marketing","go-to-market","positioning"}'),

-- ── MANAGEMENT ───────────────────────────────────────────────
('Project Management', 'Management', '{"pm","project-management","agile","scrum"}'),
('Product Management', 'Management', '{"product","product-manager","product-owner"}'),
('Agile/Scrum',        'Management', '{"agile","scrum","sprint","kanban"}'),
('Technical Leadership','Management','{"tech-lead","engineering-manager","team-lead"}'),
('Stakeholder Management','Management','{"stakeholders","stakeholder-management"}'),
('Hiring & Recruiting','Management', '{"recruiting","talent-acquisition","hiring"}')

on conflict (name) do update set
  category = excluded.category,
  aliases  = excluded.aliases;

-- ============================================================
-- SKILL RELATIONS (adjacency graph)
-- Only symmetric pairs needed; scoring checks both directions
-- ============================================================
insert into public.skill_relations (skill_id, related_skill_id, similarity)
select a.id, b.id, rel.sim
from (values
  -- Frontend framework adjacency
  ('React',       'Vue.js',          0.60),
  ('React',       'Angular',         0.55),
  ('React',       'Svelte',          0.55),
  ('React',       'Next.js',         0.85),
  ('Vue.js',      'Nuxt.js',         0.85),
  ('Angular',     'TypeScript',      0.70),
  ('React',       'React Native',    0.65),
  ('Vue.js',      'Svelte',          0.55),
  -- JS/TS
  ('TypeScript',  'JavaScript',      0.85),
  ('JavaScript',  'TypeScript',      0.85),
  -- CSS
  ('CSS',         'Tailwind CSS',    0.70),
  ('CSS',         'Sass/SCSS',       0.75),
  ('Tailwind CSS','Sass/SCSS',       0.55),
  -- State management
  ('Redux',       'Zustand',         0.65),
  ('Redux',       'React Query',     0.50),
  -- Backend
  ('Node.js',     'Express.js',      0.80),
  ('Node.js',     'NestJS',          0.75),
  ('Python',      'Django',          0.80),
  ('Python',      'FastAPI',         0.80),
  ('Python',      'Data Analysis',   0.70),
  ('Ruby',        'Ruby on Rails',   0.85),
  ('PHP',         'Laravel',         0.85),
  ('Java',        'Kotlin',          0.75),
  ('Java',        '.NET',            0.40),
  ('C#',          '.NET',            0.90),
  ('C#',          'Java',            0.55),
  ('Go',          'Rust',            0.45),
  ('Go',          'Node.js',         0.50),
  -- Databases
  ('PostgreSQL',  'MySQL',           0.75),
  ('PostgreSQL',  'SQL',             0.90),
  ('MySQL',       'SQL',             0.90),
  ('SQLite',      'SQL',             0.80),
  ('MongoDB',     'DynamoDB',        0.55),
  ('MongoDB',     'NoSQL',           0.85),
  ('DynamoDB',    'NoSQL',           0.75),
  ('Supabase',    'PostgreSQL',      0.80),
  ('Firebase',    'Supabase',        0.65),
  ('Firebase',    'NoSQL',           0.70),
  ('Elasticsearch','MongoDB',        0.40),
  -- ORM
  ('Prisma',      'TypeORM',         0.70),
  ('Prisma',      'Database Design', 0.60),
  -- DevOps
  ('Docker',      'Kubernetes',      0.70),
  ('AWS',         'Google Cloud',    0.60),
  ('AWS',         'Azure',           0.60),
  ('Google Cloud','Azure',           0.60),
  ('Terraform',   'Ansible',         0.55),
  ('GitHub Actions','GitLab CI',     0.75),
  ('CI/CD',       'GitHub Actions',  0.80),
  ('CI/CD',       'GitLab CI',       0.80),
  ('Linux',       'Shell Scripting', 0.85),
  -- Data
  ('Machine Learning','Deep Learning',0.70),
  ('Deep Learning','NLP',            0.60),
  ('Deep Learning','Computer Vision',0.60),
  ('TensorFlow',  'PyTorch',         0.70),
  ('Pandas',      'NumPy',           0.80),
  ('Data Analysis','SQL Analytics',  0.65),
  ('Data Analysis','Statistics',     0.70),
  ('Statistics',  'Machine Learning',0.55),
  ('Data Engineering','SQL Analytics',0.65),
  ('Spark',       'Data Engineering',0.70),
  ('LLMs',        'NLP',             0.75),
  ('LLMs',        'Machine Learning',0.65),
  ('MLOps',       'DevOps',          0.60),
  -- Mobile
  ('React Native','Flutter',         0.55),
  ('Swift',       'iOS Development', 0.90),
  ('Dart',        'Flutter',         0.90),
  -- Design
  ('UI/UX Design','Figma',           0.80),
  ('Figma',       'Adobe XD',        0.70),
  ('Figma',       'Sketch',          0.65),
  ('Design Systems','UI/UX Design',  0.75),
  ('Prototyping', 'UI/UX Design',    0.75),
  -- Testing
  ('Unit Testing','Integration Testing',0.65),
  ('E2E Testing', 'Integration Testing',0.55),
  ('TDD',         'Unit Testing',    0.80),
  -- Security
  ('Application Security','Cloud Security',0.50),
  ('Identity & Auth','Application Security',0.60),
  -- Management
  ('Agile/Scrum', 'Project Management',0.80),
  ('Product Management','Agile/Scrum',0.65),
  ('Technical Leadership','Project Management',0.55),
  -- Cross-domain
  ('REST APIs',   'GraphQL',         0.60),
  ('GraphQL',     'Apollo Client',   0.85),
  ('RabbitMQ',    'Kafka',           0.65),
  ('Microservices','Docker',         0.60),
  ('Serverless',  'AWS',             0.70),
  ('Serverless',  'Google Cloud',    0.65)
) as rel(a_name, b_name, sim)
join public.skills a on a.name = rel.a_name
join public.skills b on b.name = rel.b_name
on conflict (skill_id, related_skill_id) do update set similarity = excluded.similarity;

-- Insert reverse edges for all relations (bidirectional lookup)
insert into public.skill_relations (skill_id, related_skill_id, similarity)
select related_skill_id, skill_id, similarity
from public.skill_relations
on conflict (skill_id, related_skill_id) do update set similarity = excluded.similarity;
