/**
 * M.o.C. (Master of Command)
 * Logic V2
 */

const app = {
    state: {
        currentTab: 'map',
        unlockedLevels: JSON.parse(localStorage.getItem('moc_unlockedLevels')) || [1],
        userLevel: parseInt(localStorage.getItem('moc_userLevel')) || 1, // Legacy field, kept for safety
        completedWorkshops: JSON.parse(localStorage.getItem('moc_completedWorkshops')) || []
    },

    // Save System
    saveState() {
        localStorage.setItem('moc_unlockedLevels', JSON.stringify(this.state.unlockedLevels));
        localStorage.setItem('moc_userLevel', this.state.userLevel);
        localStorage.setItem('moc_completedWorkshops', JSON.stringify(this.state.completedWorkshops));
    },

    // V11.5 Global Level System
    updateGlobalLevel() {
        // Base Level = 1 + (Completed Nodes / 2)
        const completedCount = this.state.completedNodes.length;
        const mapLevel = 1 + Math.floor(completedCount / 2);

        // Workshop Bonus = +1 Level per 2 Workshops completed
        const workshopBonus = Math.floor(this.state.completedWorkshops.length / 2);

        const totalLevel = Math.min(99, mapLevel + workshopBonus);
        this.state.currentLevel = totalLevel; // Cache for other views

        // Update UI
        const label = document.getElementById('current-level-label');
        if (label) label.innerText = totalLevel;

        const titleLabel = document.getElementById('current-level-name');
        if (titleLabel) titleLabel.innerText = this.getLevelTitle(totalLevel);

        // Progress Bar Calculation (Approx 20 nodes for max visual)
        const progressPct = Math.min(100, (completedCount / 20) * 100);
        const bar = document.querySelector('.progress-fill');
        if (bar) bar.style.width = `${progressPct}%`;

        return totalLevel;
    },

    resetState() {
        if (confirm('本当に進捗をリセットしますか？ (Are you sure you want to reset all progress?)')) {
            localStorage.clear();
            location.reload();
        }
    },

    // Mock Database of Commands (V2 Expansion - 50+ Commands)
    commandDB: [
        // World Management
        { name: '/time', desc: '時間を変更する', syntax: '/time set <value>', category: 'World' },

        { name: '/weather', desc: '天候を変更する', syntax: '/weather <type> [duration]', category: 'World' },
        { name: '/difficulty', desc: '難易度を変更する', syntax: '/difficulty <peaceful|easy|normal|hard>', category: 'World' },
        { name: '/gamerule', desc: 'ゲームのルールを変更する', syntax: '/gamerule <rule> <value>', category: 'World' },
        { name: '/worldborder', desc: 'ワールドの境界線を設定する', syntax: '/worldborder set <size>', category: 'World' },
        { name: '/seed', desc: 'ワールドのシード値を表示', syntax: '/seed', category: 'World' },
        { name: '/setworldspawn', desc: 'ワールドの初期スポーン地点を設定', syntax: '/setworldspawn [pos]', category: 'World' },

        // Player Management
        { name: '/gamemode', desc: 'ゲームモードを変更する', syntax: '/gamemode <mode> [target]', category: 'Player' },
        { name: '/give', desc: 'アイテムを与える', syntax: '/give <target> <item> [amount]', category: 'Player' },
        { name: '/clear', desc: 'アイテムを消去する', syntax: '/clear [target] [item]', category: 'Player' },
        { name: '/xp', desc: '経験値を与える/減らす', syntax: '/xp add <target> <amount> [levels]', category: 'Player' },
        { name: '/spawnpoint', desc: '個人のスポーン地点を設定', syntax: '/spawnpoint [target] [pos]', category: 'Player' },
        { name: '/op', desc: 'オペレーター権限を与える', syntax: '/op <player>', category: 'Player' },
        { name: '/deop', desc: 'オペレーター権限を剥奪する', syntax: '/deop <player>', category: 'Player' },
        { name: '/kick', desc: 'プレイヤーをキックする', syntax: '/kick <target> [reason]', category: 'Player' },
        { name: '/ban', desc: 'プレイヤーをBANする', syntax: '/ban <target> [reason]', category: 'Player' },

        // Entity Management
        { name: '/tp', desc: 'テレポートさせる', syntax: '/tp <target> <location>', category: 'Entity' },
        { name: '/kill', desc: 'エンティティを殺す', syntax: '/kill <target>', category: 'Entity' },
        { name: '/summon', desc: 'エンティティを召喚する', syntax: '/summon <entity> [pos] [nbt]', category: 'Entity' },
        { name: '/effect', desc: 'ポーション効果の操作', syntax: '/effect give <target> <effect> [seconds] [amp]', category: 'Entity' },
        { name: '/attribute', desc: 'エンティティの属性を変更', syntax: '/attribute <target> <attribute> get|set ...', category: 'Entity' },
        { name: '/enchant', desc: '手に持ったアイテムにエンチャント', syntax: '/enchant <target> <enchantment> [level]', category: 'Entity' },

        // Block & Area
        { name: '/fill', desc: '指定範囲をブロックで埋める', syntax: '/fill <from> <to> <block>', category: 'Block' },
        { name: '/setblock', desc: '指定位置にブロックを置く', syntax: '/setblock <pos> <block>', category: 'Block' },
        { name: '/clone', desc: 'ブロックをコピーして移動', syntax: '/clone <begin> <end> <dest>', category: 'Block' },
        { name: '/particle', desc: 'パーティクルを表示', syntax: '/particle <name> [pos]', category: 'Block' },
        { name: '/playsound', desc: '音を鳴らす', syntax: '/playsound <sound> <source> <target>', category: 'Block' },

        // Logic & Scoreboard
        { name: '/scoreboard', desc: 'スコア(変数)の管理', syntax: '/scoreboard objectives|players ...', category: 'Logic' },
        { name: '/tag', desc: 'タグ(メタデータ)の管理', syntax: '/tag <target> add|remove <name>', category: 'Logic' },
        { name: '/team', desc: 'チームの管理', syntax: '/team add <name>', category: 'Logic' },
        { name: '/trigger', desc: 'トリガーを作動させる', syntax: '/trigger <objective>', category: 'Logic' },
        { name: '/bossbar', desc: 'ボスバーを表示/操作', syntax: '/bossbar add <id> <name>', category: 'Logic' },
        { name: '/advancement', desc: '進捗の操作', syntax: '/advancement grant <target> only <id>', category: 'Logic' },

        // Advanced Execution
        { name: '/execute', desc: '高度な条件付実行', syntax: '/execute if|as|at ... run ...', category: 'Advanced' },
        { name: '/data', desc: 'NBTデータの取得・変更', syntax: '/data get|merge|modify ...', category: 'Advanced' },
        { name: '/function', desc: '関数ファイル(.mcfunction)を実行', syntax: '/function <namespace:name>', category: 'Advanced' },
        { name: '/schedule', desc: '関数の実行を予約', syntax: '/schedule function <name> <time>', category: 'Advanced' },
        { name: '/forceload', desc: 'チャンクを常時読み込みにする', syntax: '/forceload add <from> [to]', category: 'Advanced' },
        { name: '/reload', desc: 'データパックを再読み込み', syntax: '/reload', category: 'Advanced' },

        // Reference Tab Items (Merged)
        { name: '/time set day', desc: '時間を朝にする', syntax: '/time set day', category: 'Basic' },
        { name: '/weather clear', desc: '天候を晴れにする', syntax: '/weather clear', category: 'Basic' },
        { name: '/gamemode creative', desc: 'クリエイティブモード', syntax: '/gamemode creative', category: 'Basic' },
        { name: '/tp', desc: 'テレポート', syntax: '/tp @p ~ ~10 ~', category: 'Basic' },
        { name: '/kill', desc: 'キルコマンド', syntax: '/kill @e[type=!player]', category: 'Basic' },
        { name: '/effect', desc: 'エフェクト付与', syntax: '/effect give @p speed 9999 10', category: 'Basic' }
    ],

    // Global Search Index (V4)
    searchIndex: [],

    initSearchIndex() {
        this.searchIndex = [...this.commandDB]; // Start with manual DB

        // Index Learning Map
        Object.values(this.skillTree).forEach(node => {
            if (node.tags) {
                node.tags.forEach(tag => {
                    // Avoid duplicates
                    if (!this.searchIndex.some(idx => idx.name === tag)) {
                        this.searchIndex.push({
                            name: tag,
                            desc: `${node.title} で学習`,
                            syntax: node.tags.join(' '), // Approximate
                            category: 'Learning Map',
                            source: node.title
                        });
                    }
                });
            }
        });

        // Index Workshops
        Object.entries(this.workshopData).forEach(([key, ws]) => {
            ws.steps.forEach((step, i) => {
                if (step.code) {
                    const firstCmd = step.code.split(' ')[0]; // e.g. /execute
                    this.searchIndex.push({
                        name: firstCmd,
                        desc: `Workshop: ${ws.title} (Step ${i + 1})`,
                        syntax: step.code.substring(0, 50) + (step.code.length > 50 ? '...' : ''),
                        category: 'Workshop',
                        source: ws.title
                    });
                }
            });
        });

        console.log('Search Index Built:', this.searchIndex.length, 'entries');
    },

    // --- M.o.C. V3 Ultimate: Skill Tree Data ---
    skillTree: {
        // Phase 1: Foundation (Start here)
        'basic_1': {
            id: 'basic_1',
            icon: '👋',
            title: '1-1. Hello World',
            sub: 'サーバーへの挨拶',
            tags: ['/say', '/title', '/tellraw'],
            parents: [], // Root node
            goal: '挨拶システム',
            goalDesc: 'サーバーに入った人に「ようこそ！」と豪華な文字で表示するシステムを作ります。全ての始まりです。',
            content: `
            <div class="level-header">
                <h2>Node: Hello World</h2>
                <span class="level-badge">基礎 1</span>
            </div>
            <div class="level-body">
                <p class="intro-text">Minecraftのコマンドは、チャット欄に <code>/</code> を打つことから始まります。まずは文字を画面に出してみましょう。</p>
                
                <div class="lesson-section">
                    <h3>1. シンプルな挨拶 (/say)</h3>
                    <p>全てのプレイヤーにサーバーからのメッセージとしてテキストを送信します。</p>
                    <div class="syntax-box">
                        /say &lt;メッセージ&gt;
                    </div>
                    <div class="code-block-demo"><span class="cmd">/say こんにちは！</span></div>
                    <div class="pitfall-box">
                        <h4>⚠️ よくある間違い</h4>
                        <ul>
                            <li><strong>全角スラッシュ</strong>: <code>／</code> ではなく半角の <code>/</code> を使いましょう。</li>
                            <li><strong>スペース忘れ</strong>: コマンドとメッセージの間には必ず半角スペースが必要です。</li>
                        </ul>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 画面中央に表示 (/title)</h3>
                    <p>チャット欄ではなく、画面のど真ん中に大きな文字を出します。一番目立つ方法です。</p>
                    <div class="syntax-box">
                        /title &lt;対象&gt; title|subtitle &lt;JSONテキスト/文字列&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="comment">// 1. 表示する場所(title)と対象(@a)を指定</span><br>
                        <span class="cmd">/title @a title "Welcome!"</span><br>
                        <span class="comment">// 2. サブタイトル(subtitle)をセット</span><br>
                        <span class="cmd">/title @a subtitle "マイクラサーバーへようこそ"</span>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>ログインボーナス通知</strong>: 「ログインボーナスを受け取りました！」と表示</li>
                        <li><strong>ストーリーテリング</strong>: アドベンチャーマップでの会話シーン</li>
                        <li><strong>警告メッセージ</strong>: 「制限時間まであと1分！」と叫ぶ</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('basic_1')">試験を受ける (Exam)</button>
            </div>
        `
        },
        'basic_2': {
            id: 'basic_2',
            icon: '📍',
            title: '1-2. The Coordinates',
            sub: '座標と移動',
            tags: ['/tp', '~ ~ ~', 'X Y Z'],
            parents: ['basic_1'],
            goal: '簡易エレベーター',
            goalDesc: '「上の階に行く」「下の階に戻る」ボタンを作ります。3次元空間の把握は必須スキルです。',
            content: `
            <div class="level-header">
                <h2>Node: The Coordinates</h2>
                <span class="level-badge">基礎 2</span>
            </div>
            <div class="level-body">
                <p class="intro-text">マイクラの世界は X(東西), Y(高さ), Z(南北) の3つの数字でできています。</p>
                
                <div class="lesson-section">
                    <h3>1. テレポート (/tp)</h3>
                    <p>指定した座標に、一瞬で移動します。</p>
                    <div class="syntax-box">
                        /tp &lt;移動する人&gt; &lt;X&gt; &lt;Y&gt; &lt;Z&gt;
                    </div>
                    <div class="code-block-demo"><span class="cmd">/tp @p 100 64 200</span></div>
                    <div class="pro-tip">
                        <strong>💡 Pro Tip: 座標の調べ方</strong>
                        PC版では <code>F3</code> キーを押すとデバッグ画面が開きます。"XYZ" の項目を見て、現在地の座標を確認しましょう。<code>Looking at</code> は視線の先のブロック座標です。
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 相対座標 (Relative Coordinates)</h3>
                    <p><code>~</code> (チルダ) は「今の場所から」という意味です。</p>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ 仕組み解説</h4>
                        <p>コマンドの実行者が「基準」になります。</p>
                        <ul>
                            <li><code>~ ~10 ~</code> : あなたの頭上10マス</li>
                            <li><code>~1 ~ ~</code> : あなたから見てX方向に+1 (東)</li>
                            <li><code>~ ~ ~</code> : あなたと全く同じ場所</li>
                        </ul>
                    </div>
                    <br>
                    <div class="pitfall-box">
                        <h4>⚠️ よくある間違い</h4>
                        <p><code>~10</code> (チルダ+数字) の間にスペースは入れません！<br>
                        OK: <code>~10</code><br>
                        NG: <code>~ 10</code></p>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>エレベーター</strong>: ボタンを押すと <code>/tp @p ~ ~5 ~</code> で上の階へ</li>
                        <li><strong>脱出ゲーム</strong>: 特定の座標にテレポートさせるトラップ</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('basic_2')">試験を受ける (Exam)</button>
            </div>
        `
        },
        'basic_3': {
            id: 'basic_3',
            icon: '🎯',
            title: '1-3. The Selector',
            sub: 'ターゲットの選択',
            tags: ['@a', '@p', '@e', 'distance'],
            parents: ['basic_2'],
            goal: 'セキュリティドア',
            goalDesc: '「近くにいる人」だけが開けられる、または「特定のアイテムを持っている人」だけが通れるドアを作ります。',
            content: `
            <div class="level-header">
                <h2>Node: The Selector</h2>
                <span class="level-badge">基礎 3</span>
            </div>
            <div class="level-body">
                <p class="intro-text">コマンドの「誰に？」を決めるのがセレクターです。これを使いこなせば、世界中の特定の存在だけを操れます。</p>
                
                <div class="lesson-section">
                    <h3>1. 基本セレクター (Base Selectors)</h3>
                    <p>まずはこの4つを暗記しましょう。</p>
                    <ul class="concept-list">
                        <li><code>@p</code> (Nearest): <strong>一番近くにいるプレイヤー</strong>。ボタンを押した人自身を指すのによく使います。</li>
                        <li><code>@a</code> (All): <strong>全てのプレイヤー</strong>。サーバー全員に通知する時などに。</li>
                        <li><code>@e</code> (Entity): <strong>全てのエンティティ</strong>。プレイヤーだけでなく、モブ、落ちているアイテム、防具立てなど全てが含まれます。</li>
                        <li><code>@s</code> (Self): <strong>実行者自身</strong>。自分自身を対象にする場合に使いますが、コマンドブロックで使うには少しコツがいります。</li>
                    </ul>
                    <div class="pitfall-box">
                        <h4>⚠️ 危険！ @e の使いすぎに注意</h4>
                        <p><code>/kill @e</code> を実行すると、村人もトロッコも展示物も、サーバー内の全てが消滅します！必ず引数で対象を絞りましょう。</p>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 引数による絞り込み (Arguments)</h3>
                    <p><code>[ ]</code> を使って、更に細かい条件を指定できます。</p>
                    <div class="syntax-box">
                        @a[条件1=値, 条件2=値, ...]
                    </div>
                    
                    <h4>距離で絞り込む (distance)</h4>
                    <div class="code-block-demo">
                        <span class="cmd">@a[distance=..5]</span> <span class="comment">// 半径5マス以内の人 (0から5まで)</span><br>
                        <span class="cmd">@a[distance=10..]</span> <span class="comment">// 10マス以上離れている人</span>
                    </div>

                    <h4>レベルで絞り込む (level)</h4>
                    <div class="code-block-demo">
                        <span class="cmd">@a[level=30..]</span> <span class="comment">// レベル30以上のプレイヤー</span>
                    </div>
                    
                    <h4>個数制限 (limit)</h4>
                    <div class="code-block-demo">
                        <span class="cmd">@e[type=zombie, limit=1, sort=nearest]</span><br>
                        <span class="comment">// 一番近くのゾンビを1体だけ</span>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>範囲ヒール</strong>: <code>/effect give @a[distance=..10] instant_health ...</code> で近くの味方だけ回復</li>
                        <li><strong>レベルゲート</strong>: レベル不足のプレイヤーを通さないドア</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('basic_3')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'basic_4': {
            id: 'basic_4',
            icon: '🎒',
            title: '1-4. Items & Inventory',
            sub: 'アイテム管理',
            tags: ['/give', '/clear'],
            parents: ['basic_3'],
            goal: '装備支給システム',
            goalDesc: 'ボタンを押すと「最強の剣」と「回復薬」が配られるシステムを作ります。',
            content: `
            <div class="level-header">
                <h2>Node: Items & Inventory</h2>
                <span class="level-badge">基礎 4</span>
            </div>
            <div class="level-body">
                <p class="intro-text">RPGといえばアイテム。プレイヤーに報酬を与えたり、不要なものを没収したりします。</p>
                
                <div class="lesson-section">
                    <h3>1. アイテムを与える (/give)</h3>
                    <p>指定した相手にアイテムを渡します。</p>
                    <div class="syntax-box">
                        /give &lt;対象&gt; &lt;アイテムID&gt; [個数]
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/give @p diamond_sword 1</span><br>
                        <span class="comment">// プレイヤーにダイヤモンドの剣を1つ渡す</span>
                    </div>
                    <div class="pro-tip">
                        <strong>💡 アイテムIDの調べ方</strong>
                        ゲーム内で <code>F3 + H</code> を押すと「高度なツールチップ」が有効になります。インベントリでアイテムにカーソルを合わせると、<code>minecraft:diamond_sword</code> のようなIDが表示されるようになります。
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. アイテムを消す (/clear)</h3>
                    <p>インベントリからアイテムを削除します。</p>
                    <div class="syntax-box">
                        /clear &lt;対象&gt; [アイテムID] [個数]
                    </div>
                    <div class="pro-tip">
                        <strong>💡 スタック数 (Stack Size)</strong>
                        <p>1つのスロットに入るアイテムの上限数です。通常は <strong>64個</strong> ですが、雪玉などは16個、剣などは1個です。コマンドで個数を指定する時は、この上限を超えても渡せることがありますが、インベントリ内では64ごとに分割されます。</p>
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/clear @a minecraft:rotten_flesh</span><br>
                        <span class="comment">// 全員から腐った肉を全て没収</span>
                        <br><br>
                        <span class="cmd">/clear @p diamond 10</span><br>
                        <span class="comment">// ダイヤモンドを10個没収（足りない場合はあるだけ消える）</span>
                    </div>
                    
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ 所持チェックへの応用</h4>
                        <p><code>/clear</code> コマンドは、アイテムを消した時に「消した数」を返します。これを利用して、<code>0個消す</code> ＝ <code>所持しているかどうかの確認</code> だけを行うことができます。</p>
                        <div class="code-block-demo">
                            <span class="cmd">/clear @p diamond 0</span><br>
                            <span class="comment">// アイテムは消えないが、持っているかどうかが判定される</span>
                        </div>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>初期装備セット</strong>: ゲーム開始時に剣と食料を配る</li>
                        <li><strong>クエスト納品</strong>: 「リンゴを5個持ってきたらクリア」というシステム</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('basic_4')">試験を受ける (Exam)</button>
            </div>
            `
        },

        // Branching: Phase 2
        'logic_1': {
            id: 'logic_1',
            icon: '💰',
            title: '2-L1. Scoreboard Basic',
            sub: '変数の基礎',
            tags: ['/scoreboard', 'dummy'],
            parents: ['basic_4'], // Updated parent
            goal: 'お金システム',
            goalDesc: 'Scoreboardを使って「所持金」を作り、画面の右側に表示させます。',
            content: `
            <div class="level-header">
                <h2>Node: Scoreboard Basic</h2>
                <span class="level-badge">論理 1</span>
            </div>
            <div class="level-body">
                <p class="intro-text">RPGに不可欠な「HP」「マナ」「所持金」。これらを管理するのがスコアボードです。プログラミングで言う「変数」のことです。</p>
                
                <div class="lesson-section">
                    <h3>1. 変数を作る (Objectives)</h3>
                    <p>まずは「money」という名前の箱（オブジェクト）を作ります。</p>
                    <div class="syntax-box">
                        /scoreboard objectives add &lt;名前&gt; &lt;タイプ&gt; [表示名]
                    </div>
                    <div class="code-block-demo"><span class="cmd">/scoreboard objectives add money dummy "所持金"</span></div>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ "dummy" とは？</h4>
                        <p>スコアボードには「倒したゾンビの数」など自動で増えるタイプもありますが、<code>dummy</code> は「コマンドでのみ操作できる」タイプです。独自のシステムを作る時はほぼこれを使います。</p>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 画面に表示する (Display)</h3>
                    <p>右側のサイドバーにスコアを表示します。これでプレイヤーも数字を確認できます。</p>
                    <div class="code-block-demo"><span class="cmd">/scoreboard objectives setdisplay sidebar money</span></div>
                </div>

                <div class="lesson-section">
                    <h3>3. 数値を操作する (Players)</h3>
                    <p>一番重要な、数値の増減コマンドです。</p>
                    <div class="syntax-box">
                        /scoreboard players &lt;add|remove|set&gt; &lt;対象&gt; &lt;変数名&gt; &lt;数値&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/scoreboard players add @s money 100</span> <span class="comment">// 100円ゲット</span><br>
                        <span class="cmd">/scoreboard players remove @s money 50</span> <span class="comment">// 50円支払い</span><br>
                        <span class="cmd">/scoreboard players set @s money 0</span> <span class="comment">// 0円にリセット</span>
                    </div>
                </div>
                
                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>通貨システム (Economy)</strong>: <code>dummy</code> で「Money」を作り、売買システムを作る。</li>
                        <li><strong>キルカウンター (Stats)</strong>: <code>minecraft.killed:minecraft.zombie</code> タイプを使えば、倒した数を自動で数えてくれます。「100体倒したらレベルクリア」などが作れます。</li>
                        <li><strong>デスペナルティ</strong>: <code>deathCount</code> を使い、死んだ回数に応じてメッセージを変える。</li>
                    </ul>
                    <div class="pro-tip">
                        <strong>🔗 関連コマンド</strong>
                        <ul>
                            <li><code>/trigger</code>: 権限のないプレイヤーでも数値を操作できるコマンド。投票システムなどに使います。</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('logic_1')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'logic_1_5': {
            id: 'logic_1_5',
            icon: '🧮',
            title: '2-L2. Scoreboard Ops',
            sub: '変数の計算',
            tags: ['operation', '+=', '-='],
            parents: ['logic_1'],
            goal: '銀行システム',
            goalDesc: '「手持ちのお金」を「銀行」に預ける（移動させる）計算ロジックを作ります。',
            content: `
            <div class="level-header">
                <h2>Node: Scoreboard Ops</h2>
                <span class="level-badge">論理 1.5</span>
            </div>
            <div class="level-body">
                <p class="intro-text">変数は足し算や引き算だけでなく、変数同士の計算も可能です。ここから少し「プログラミング」っぽくなります。</p>
                
                <div class="lesson-section">
                    <h3>1. 変数同士の演算 (Operation)</h3>
                    <p>Score A に Score B を足す、などの操作です。</p>
                    <div class="syntax-box">
                        /scoreboard players operation &lt;計算される人&gt; &lt;変数&gt; &lt;記号&gt; &lt;計算に使う人&gt; &lt;変数&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/scoreboard players operation @s money += @s bank</span><br>
                        <span class="comment">// 意味: money = money + bank</span>
                        <span class="comment">// 「所持金に、銀行の残高を足す（引き出し）」</span>
                    </div>
                    
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ 使える記号一覧</h4>
                        <ul class="concept-list">
                            <li><code>+=</code> : 足し算 (Add)</li>
                            <li><code>-=</code> : 引き算 (Subtract)</li>
                            <li><code>*=</code> : 掛け算 (Multiply)</li>
                            <li><code>/=</code> : 割り算 (Divide)</li>
                            <li><code>%=</code> : 割り算の余り (Modulo)</li>
                            <li><code>=</code> : 代入 (Copy)</li>
                        </ul>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 代入と交換 (Assign & Swap)</h3>
                    <p>値をコピーしたり、入れ替えたりします。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/scoreboard players operation @s money = @s bank</span><br>
                        <span class="comment">// 銀行の額を、所持金に上書きコピー (money becomes bank)</span>
                        <br><br>
                        <span class="cmd">/scoreboard players operation @s money &gt;&lt; @s bank</span><br>
                        <span class="comment">// 所持金と銀行の額を入れ替える (Swap)</span>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>ダメージ計算機</strong>: 「攻撃力スコア」から「防御力スコア」を引き、残った分だけ相手のHPを減らす本格RPG。</li>
                        <li><strong>カジノ</strong>: <code>%= 2</code> (2で割った余り) を使うと、結果は必ず 0 か 1 になります。これを利用して「丁半博打」が作れます。</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('logic_1_5')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'world_1': {
            id: 'world_1',
            icon: '🌎',
            title: '2-W1. World Control',
            sub: '世界のルール',
            tags: ['/gamerule', '/fill'],
            parents: ['basic_4'],
            goal: '撮影スタジオ',
            goalDesc: '時間を止め、Mobが湧かない平和な世界を作ります。建築の基本です。',
            content: `
            <div class="level-header">
                <h2>Node: World Control</h2>
                <span class="level-badge">世界 1</span>
            </div>
            <div class="level-body">
                <p class="intro-text">開発に集中するための環境を整えます。天候や時間を固定することで、常に最高の「舞台」を維持しましょう。</p>
                
                <div class="lesson-section">
                    <h3>1. ルール設定 (/gamerule)</h3>
                    <p>ワールド全体の法則を書き換えます。</p>
                    <div class="syntax-box">
                        /gamerule &lt;ルール名&gt; &lt;true|false|数値&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/gamerule doDaylightCycle false</span> <span class="comment">// 時間経過を停止</span><br>
                        <span class="cmd">/gamerule doWeatherCycle false</span> <span class="comment">// 天候変化を停止</span><br>
                        <span class="cmd">/gamerule doMobSpawning false</span> <span class="comment">// 勝手にモブが湧かないようにする</span><br>
                        <span class="cmd">/gamerule keepInventory true</span> <span class="comment">// 死んでもアイテムを落とさない</span>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 整地 (/fill)</h3>
                    <p>一瞬でブロックを敷き詰めます。建築の土台作りに必須です。</p>
                    <div class="syntax-box">
                        /fill &lt;始点&gt; &lt;終点&gt; &lt;ブロック&gt; [置換モード]
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/fill ~-10 ~-1 ~-10 ~10 ~-1 ~10 stone</span><br>
                        <span class="comment">// 自分を中心に20x20の石の床を作成</span>
                    </div>
                    <div class="pitfall-box">
                        <h4>⚠️ 空気もブロックです</h4>
                        <p>邪魔な山を消したい時は、<code>air</code> (空気ブロック) で埋め尽くしましょう。<br>
                        <code>/fill ... air</code></p>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>撮影スタジオ</strong>: 常に快晴のフラットな世界</li>
                        <li><strong>アスレチック会場</strong>: 落下してもダメージを受けない設定 (fallDamage)</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('world_1')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'world_1_5': {
            id: 'world_1_5',
            icon: '✨',
            title: '2-W2. World FX',
            sub: '演出とエフェクト',
            tags: ['/particle', '/playsound'],
            parents: ['world_1'],
            goal: '魔法陣',
            goalDesc: '足元から光のパーティクルと、魔法の詠唱音が出る演出を作ります。',
            content: `
            <div class="level-header">
                <h2>Node: World FX</h2>
                <span class="level-badge">世界 1.5</span>
            </div>
            <div class="level-body">
                <p class="intro-text">サーバーのクオリティは「演出」で決まります。視覚と聴覚をハックしましょう。</p>
                
                <div class="lesson-section">
                    <h3>1. パーティクル (/particle)</h3>
                    <p>炎、煙、ハートなどを出現させます。</p>
                    <div class="syntax-box">
                        /particle &lt;種類&gt; &lt;座標&gt; &lt;範囲X Y Z&gt; &lt;速度&gt; &lt;個数&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/particle flame ~ ~1 ~ 0.5 0.5 0.5 0.01 10</span>
                    </div>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ パラメータの解読</h4>
                        <ul class="no-dot">
                            <li><strong>範囲 (Delta)</strong>: <code>0.5 0.5 0.5</code> → 0.5マスの範囲に散らばる</li>
                            <li><strong>速度 (Speed)</strong>: <code>0.01</code> → ほぼ動かない (0だと完全に停止)</li>
                            <li><strong>個数 (Count)</strong>: <code>10</code> → 10個出す</li>
                        </ul>
                    </div>
                </div>

                <!-- One Liner -->
                <div class="one-line-box">
                    <div class="one-line-code">/particle flame ~ ~1 ~ 0.5 0.5 0.5 0.01 10</div>
                    <button class="copy-btn" onclick="app.copyToClipboard('/particle flame ~ ~1 ~ 0.5 0.5 0.5 0.01 10')">Copy</button>
                </div>

                <div class="lesson-section">
                    <h3>2. サウンド (/playsound)</h3>
                    <p>BGMや効果音を鳴らします。</p>
                    <div class="syntax-box">
                        /playsound &lt;音ID&gt; &lt;区分&gt; &lt;対象&gt; [座標] [音量] [ピッチ]
                    </div>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                         <h4>⚙️ 音の区分 (Source)</h4>
                         <p>「どのボリューム設定で音を鳴らすか」を決めます。</p>
                         <ul class="no-dot">
                             <li><code>master</code>: 主音量 (全体)</li>
                             <li><code>music</code>: BGM</li>
                             <li><code>record</code>: ジュークボックス/音符ブロック</li>
                             <li><code>ambient</code>: 環境音 (洞窟音など)</li>
                         </ul>
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/playsound entity.experience_orb.pickup master @a ~ ~ ~ 1 0.5</span>
                    </div>
                    <div class="pro-tip">
                        <strong>💡 ピッチ (Pitch) の魔術</strong>
                        最後の数字「ピッチ」を変えると音が変わります。
                        <ul>
                            <li><code>0.5</code> : 低い音 (スロー再生のような音)</li>
                            <li><code>1.0</code> : 原音</li>
                            <li><code>2.0</code> : 高い音 (倍速再生のような音)</li>
                        </ul>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>魔法の詠唱</strong>: 杖を振るとパーティクルと共に不思議な音が鳴る</li>
                        <li><strong>レベルアップ演出</strong>: <code>ui.toast.challenge_complete</code> で豪華なファンファーレ</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('world_1_5')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'entity_1': {
            id: 'entity_1',
            icon: '🧟',
            title: '2-E1. Summoning Ops',
            sub: '召喚術',
            tags: ['/summon', 'Coordinates'],
            parents: ['basic_4'],
            goal: '魔王の召喚',
            goalDesc: '特定の位置に、装備を整えたモンスターを召喚します。',
            content: `
            <div class="level-header">
                <h2>Node: Summoning Arts</h2>
                <span class="level-badge">生命 1</span>
            </div>
            <div class="level-body">
                <p class="intro-text">エンティティ（動くもの）を操る力。それは生命を創造する力です。</p>
                
                <div class="lesson-section">
                    <h3>1. 召喚 (/summon)</h3>
                    <p>モンスターや動物、アイテムなどを呼び出します。</p>
                    <div class="syntax-box">
                        /summon &lt;エンティティID&gt; [座標] [NBTタグ]
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/summon zombie ~ ~ ~</span> <span class="comment">// 目の前にゾンビ</span><br>
                        <span class="cmd">/summon villager ~ ~ ~ {Age:-20000}</span> <span class="comment">// 子供の村人を召喚</span>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 視線座標 (Local Coordinates)</h3>
                    <p><code>^</code> (キャレット) を使うと、「自分の向いている方向」を基準にできます。</p>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ X Y Z との違い</h4>
                        <ul>
                            <li><code>~ ~ ~</code> : 方角に関係なく、マップの東西南北が基準 (絶対的)</li>
                            <li><code>^ ^ ^</code> : 「左・上・前」が基準 (あなたの視線に依存)</li>
                        </ul>
                        <div class="code-block-demo">
                            <span class="cmd">/summon lightning_bolt ^ ^ ^5</span><br>
                            <span class="comment">// あなたが見ている方向、5マス先に雷を落とす</span>
                        </div>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>魔法の杖</strong>: 杖を振った方向にファイアボールを飛ばす</li>
                        <li><strong>ボス出現イベント</strong>: 神殿の中央にエフェクトと共にボスを召喚</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('entity_1')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'entity_2': {
            id: 'entity_2',
            icon: '⚔️',
            title: '2-E2. Equipment NBT',
            sub: '装備とデータ',
            tags: ['HandItems', 'ArmorItems'],
            parents: ['entity_1'],
            goal: '最強装備の勇者',
            goalDesc: 'フル装備のスケルトンを作成し、倒した時に特定のアイテムを落とさせます。',
            content: `
            <div class="level-header">
                <h2>Node: Equipment & NBT</h2>
                <span class="level-badge">生命 2</span>
            </div>
            <div class="level-body">
                <p class="intro-text">ただ召喚するだけでは雑魚敵です。最強の装備を与えましょう。ここでついに「NBT（データタグ）」が登場します。</p>
                
                <div class="lesson-section">
                    <h3>1. 装備の設定 (HandItems)</h3>
                    <p>右手に剣、左手に盾を持たせます。</p>
                    <div class="syntax-box">
                        {HandItems:[{右手}, {左手}]}
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/summon skeleton ~ ~ ~ {</span><br>
                        <span class="cmd">&nbsp;&nbsp;HandItems:[</span><br>
                        <span class="cmd">&nbsp;&nbsp;&nbsp;&nbsp;{id:"diamond_sword", Count:1b},</span> <span class="comment">// 右手</span><br>
                        <span class="cmd">&nbsp;&nbsp;&nbsp;&nbsp;{id:"shield", Count:1b}</span>         <span class="comment">// 左手</span><br>
                        <span class="cmd">&nbsp;&nbsp;]</span><br>
                        <span class="cmd">}</span>
                    </div>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ 呪文の解読（インデント）</h4>
                        <p>中カッコ <code>{}</code> や 角カッコ <code>[]</code> が重なると混乱しますよね。まずは<strong>「外側のカッコから順番に」</strong>見ていくのがコツです。</p>
                        <ul class="concept-list">
                            <li>1つ目が右手、2つ目が左手です。</li>
                        </ul>
                        <hr style="border:0; border-top:1px solid #444; margin:10px 0;">
                        <h4>⚙️ 防具の設定 (ArmorItems)</h4>
                        <p>防具も <code>ArmorItems</code> というリストで管理しますが、順番に注意が必要です。<br>
                        <strong>[靴, 脚, 胸, 頭]</strong> の順で指定します。（下から上の順と覚えましょう）</p>
                        <div class="code-block-demo">
                            ArmorItems:[{Count:1b,id:"leather_boots"}, {Count:1b,id:"...leggings"}, ...]
                        </div>
                    </div>
                </div>

                <!-- One Liner -->
                <div class="one-line-box">
                    <div class="one-line-code">/summon skeleton ~ ~ ~ {HandItems:[{id:"diamond_sword",Count:1b},{id:"shield",Count:1b}]}</div>
                    <button class="copy-btn" onclick="app.copyToClipboard('/summon skeleton ~ ~ ~ {HandItems:[{id:&quot;diamond_sword&quot;,Count:1b},{id:&quot;shield&quot;,Count:1b}]}')">Copy</button>
                </div>

                <div class="lesson-section">
                    <h3>2. 名前をつける (CustomName)</h3>
                    <p>ネームタグなしで、最初から名前を表示させます。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/summon pig ~ ~ ~ {</span><br>
                        <span class="cmd">&nbsp;&nbsp;CustomName:'"Piggy"',</span> <span class="comment">// 名前（シングル引用符の中にダブル引用符！）</span><br>
                        <span class="cmd">&nbsp;&nbsp;CustomNameVisible:1b</span> <span class="comment">// 常に表示するフラグ</span><br>
                        <span class="cmd">}</span>
                    </div>
                    <div class="pitfall-box">
                        <h4>⚠️ 引用符の罠 ' " " '</h4>
                        <p>名前は JSONテキスト という形式で書くため、<code>'"名前"'</code> のように引用符が二重になります。最初は「そういうものだ」とコピペから始めましょう。</p>
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ これで何が作れる？</h3>
                    <ul>
                        <li><strong>RPGの敵キャラ</strong>: 名前と装備を持った手強い敵</li>
                        <li><strong>ショップNPC</strong>: 名前付きの動かない村人 (<code>NoAI:1b</code>)</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('entity_2')">試験を受ける (Exam)</button>
            </div>
            `
        },

        // Branching: Phase 2.5
        'logic_2': {
            id: 'logic_2',
            icon: '🏷️',
            title: '2-L3. Tags & Teams',
            sub: 'グループ管理',
            tags: ['/tag', '/team'],
            parents: ['logic_1_5'],
            goal: 'PvPチーム分け',
            goalDesc: 'プレイヤーを「赤チーム」「青チーム」に分け、同士討ちを無効化します。',
            content: `
            <div class="level-header">
                <h2>Node: Tags & Teams</h2>
                <span class="level-badge">論理 2</span>
            </div>
            <div class="level-body">
                <p class="intro-text">特定のプレイヤーだけを特別扱いしたい？変数は数字しか扱えませんが、「タグ」なら「鬼」「リーダー」のようなラベル貼りができます。</p>
                
                <div class="lesson-section">
                    <h3>1. タグを貼る (/tag)</h3>
                    <p>プレイヤーに付箋を貼るイメージです。</p>
                    <div class="syntax-box">
                        /tag &lt;対象&gt; &lt;add|remove&gt; &lt;タグ名&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/tag @p add Oni</span> <span class="comment">// 近くの人に「Oni」タグを貼る</span><br>
                        <span class="cmd">/say @a[tag=Oni] は鬼です！</span> <span class="comment">// 鬼だけを指名する</span>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. チーム分け (/team)</h3>
                    <p>タグの上位版です。色を変えたり、同士討ちを無効にできます。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/team add red "赤チーム"</span> <span class="comment">// チーム作成</span><br>
                        <span class="cmd">/team join red @p</span> <span class="comment">// 自分を参加させる</span><br>
                        <span class="cmd">/team modify red color red</span> <span class="comment">// 名前を赤色にする</span>
                    </div>
                    <div class="pro-tip">
                        <strong>💡 タグ vs チーム</strong>
                        <ul>
                            <li><strong>タグ</strong>: 内部的な処理用（鬼ごっこの鬼など）。見えない。</li>
                            <li><strong>チーム</strong>: 表示用（名前の色など）。見える。一人一つまで。</li>
                        </ul>
                    </div>
                </div>
                
                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>職業システム (Class)</strong>: 「戦士タグ」の人には剣を配布、「魔導師タグ」の人には杖を配布。</li>
                        <li><strong>ケイドロ</strong>: 警察チームと泥棒チームに分け、警察が泥棒を攻撃すると「監獄」へテレポートさせる。</li>
                    </ul>
                    <div class="pro-tip">
                        <strong>🔗 関連コマンド</strong>
                        <ul>
                            <li><code>/team modify &lt;team&gt; collisionRule never</code>: チームメイト同士の体がぶつからないようにします（アスレチックなどで重要）。</li>
                            <li><code>/team modify &lt;team&gt; friendlyFire false</code>: 同士討ちを無効化します。</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('logic_2')">試験を受ける (Exam)</button>
            </div>
            `
        },
        'world_2': {
            id: 'world_2',
            icon: '🏗️',
            title: '2-W3. Copy & Paste',
            sub: '建築コピー',
            tags: ['/clone', '/structure'],
            parents: ['world_1_5'],
            goal: 'ダンジョン複製',
            goalDesc: '作った部屋をコピーして、無限に続くダンジョン通路を一瞬で作ります。',
            content: `
            <div class="level-header">
                <h2>Node: Copy & Paste</h2>
                <span class="level-badge">世界 2</span>
            </div>
            <div class="level-body">
                <p class="intro-text">建築をブロック単位でコピーします。もう同じ家を何軒も手動で建てる必要はありません。</p>
                
                <div class="lesson-section">
                    <h3>1. コピー (/clone)</h3>
                    <p>「ここから、ここまでを、あそこへ」コピーします。</p>
                    <div class="syntax-box">
                        /clone &lt;始点&gt; &lt;終点&gt; &lt;貼り付け先&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/clone 0 60 0 10 70 10 ~ ~ ~</span><br>
                        <span class="comment">// (0,60,0)〜(10,70,10) の範囲を、今の場所にペースト</span>
                    </div>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                        <h4>⚙️ 座標のイメージ</h4>
                        <img src="https://minecraft.wiki/images/Clone_command_schematic.png" alt="Clone Diagram" style="width:100%; border-radius:4px; opacity:0.8;">
                        <p>「始点と終点で囲まれた箱」を「貼り付け先の北西の角」に置くイメージです。</p>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 構造物 (/structure)</h3>
                    <p>V1.19からの新機能。コピーしたものを「ファイル」として保存し、別のワールドでも使えるようにします。</p>
                    <div class="pro-tip">
                        <strong>💡 ストラクチャーブロック</strong>
                        コマンドを打つよりも、専用ブロック <code>/give @p structure_block</code> を使って視覚的に範囲を決めるのが現代の主流です。
                    </div>
                </div>

                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>ダンジョン生成</strong>: あらかじめ作っておいた「部屋」のパターンを、乱数を使って継ぎ足していくことで「入るたびに変わるダンジョン」が作れます。</li>
                        <li><strong>アリーナのリセット</strong>: PvPが終わったら、ボタン一つでボロボロになったステージを新品に戻すことができます。</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('world_2')">試験を受ける (Exam)</button>
            </div>
            </div>
            `
        },

        // Phase 3: Concvergence (Mid-Boss)
        'master_1': {
            id: 'master_1',
            icon: '⚡',
            title: '3-Core. The Execute',
            sub: '究極の実行',
            tags: ['/execute', 'run', 'if'],
            parents: ['logic_2', 'world_2', 'entity_2'], // Requires all 3 now
            goal: '魔法の弓',
            goalDesc: '「氷の上に立っている時」だけ「足が速くなる」、あるいは「矢が当たった場所」に「雷を落とす」魔法を作ります。',
            content: `
            <div class="level-header">
                <h2>Node: The Execute</h2>
                <span class="level-badge">上級 1</span>
            </div>
            <div class="level-body">
                <p class="intro-text">コマンドの王様、Execute。これを理解すれば作れないものはありません。</p>
                <div class="lesson-section">
                    <h3>1. 場所を変えて実行 (at)</h3>
                    <p>矢が刺さっている場所で雷を召喚します。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/execute at @e[type=arrow,nbt={inGround:1b}] run summon lightning_bolt</span>
                    </div>
                </div>
                <div class="lesson-section">
                    <h3>2. 条件付き実行 (if block)</h3>
                    <p>足元が金ブロックなら跳躍力アップ。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/execute at @a if block ~ ~-1 ~ gold_block run effect give @p jump_boost 1 1</span>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_1')">試験を受ける (Exam)</button>
            </div>
                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>特殊能力付き装備</strong>: 「金の剣」を持っている時だけ、攻撃力や移動速度が上がる。</li>
                        <li><strong>魔法の杖</strong>: 人参付きの棒を右クリックした瞬間を検知し、視線の先にファイアボールを召喚する。</li>
                        <li><strong>即死トラップ</strong>: 特定の色のカーペットに乗ったら、落とし穴が開く。</li>
                    </ul>
                     <div class="pro-tip">
                        <strong>🔗 関連コマンド</strong>
                        <ul>
                            <li><code>/execute store result ...</code>: コマンドの実行結果（成功回数やアイテム数など）を、スコアボードに保存できます。上級者への第一歩です。</li>
                        </ul>
                    </div>
                </div>
            `
        },

        // Phase 3: Advanced Branches
        'logic_3': {
            id: 'logic_3',
            icon: '📜',
            title: '3-L1. Functions',
            sub: '関数の力',
            tags: ['/function', 'Datapacks'],
            parents: ['master_1'],
            goal: 'データパック入門',
            goalDesc: '100行のコマンドを1行で実行します。',
            content: `
            <div class="level-header">
                <h2>Node: Functions</h2>
                <span class="level-badge">論理 3</span>
            </div>
            <div class="level-body">
                <p class="intro-text">コマンドブロックに書ききれない？テキストファイルに書きましょう。</p>
                <div class="lesson-section">
                    <h3>1. ファンクション (/function)</h3>
                    <p>外部ファイルのコマンド群を一括実行します。</p>
                    <div class="code-block-demo">
                         <span class="cmd">/function my_pack:start_game</span>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('logic_3')">試験を受ける (Exam)</button>
            </div>
                <div class="practical-use-box">
                    <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                    <ul>
                        <li><strong>大規模ミニゲーム</strong>: 1つのコマンドブロックから <code>start_game</code> 関数を呼び出すだけで、リセット・チーム分け・テレポート・装備配布を全部一瞬で行う。</li>
                        <li><strong>配布マップ</strong>: 「データパック」としてフォルダごと配布すれば、誰でもあなたの作ったシステムを導入できます。</li>
                    </ul>
                     <div class="pro-tip">
                        <strong>🔗 関連機能</strong>
                        <ul>
                            <li><strong>Datapacks</strong>: 関数やルートテーブルをまとめたフォルダ構成のこと。ワールドフォルダ内の <code>datapacks/</code> に入れます。</li>
                        </ul>
                    </div>
                </div>
            `
        },
        'world_3': {
            id: 'world_3',
            icon: '🏛️',
            title: '3-W1. Structures',
            sub: '構造物工学',
            tags: ['Jigsaw', 'Structure'],
            parents: ['master_1'],
            goal: '村の自動生成',
            goalDesc: 'ジグソーブロックを使って、ランダムに繋がるダンジョンを作ります。',
            content: `
             <div class="level-header">
                <h2>Node: Structure Engineering</h2>
                <span class="level-badge">世界 3</span>
            </div>
            <div class="level-body">
                <p class="intro-text">マインクラフトの村生成アルゴリズムを自分で使いこなしましょう。「ジグソーブロック」を使えば、部屋と部屋を自動で接続できます。</p>
                
                <div class="lesson-section">
                    <h3>1. 構造物の保存 (Structure Block)</h3>
                    <p>まずはパーツとなる部屋を作って保存します。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/give @p structure_block</span>
                    </div>
                    <p>ブロックを置いて「保存モード」にし、名前（例: <code>my_dungeon:room_1</code>）を付けて保存します。</p>
                </div>

                <div class="lesson-section">
                    <h3>2. 接続設定 (Jigsaw Block)</h3>
                    <p>部屋の入り口にジグソーブロックを置きます。</p>
                    <ul class="concept-list">
                        <li><strong>Target Pool</strong>: どのグループの部屋と繋がるか</li>
                        <li><strong>Name</strong>: この接続ポイントの名前</li>
                    </ul>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('world_3')">試験を受ける (Exam)</button>
            </div>
             <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>ローグライクダンジョン</strong>: 「通路」「宝部屋」「ボス部屋」をプールに登録し、<code>/place structure</code> コマンド一発で無限に遊べる迷宮を生成する。</li>
                </ul>
            </div>
            `
        },
        'entity_3': {
            id: 'entity_3',
            icon: '👹',
            title: '3-E1. Attributes',
            sub: 'ボス創造',
            tags: ['/attribute', 'Bossbar'],
            parents: ['master_1'],
            goal: 'レイドボス',
            goalDesc: 'HP1000、攻撃力50、ノックバック耐性MAXの巨人を作ります。',
            content: `
             <div class="level-header">
                <h2>Node: Attributes</h2>
                <span class="level-badge">生命 3</span>
            </div>
            <div class="level-body">
                <p class="intro-text">限界突破したステータスを持つモンスターを生み出します。ボス戦の演出にはボスバーも欠かせません。</p>
                
                <div class="lesson-section">
                    <h3>1. 属性変更 (/attribute)</h3>
                    <p>攻撃力、体力、移動速度などを数値で指定します。</p>
                    <div class="syntax-box">
                        /attribute &lt;対象&gt; &lt;項目&gt; base set &lt;数値&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/attribute @e[type=zombie,limit=1] minecraft:generic.max_health base set 100</span>
                    </div>
                    <div class="pro-tip">
                        <strong>💡 代表的なAttribute</strong>
                        <ul class="no-dot">
                            <li><code>generic.attack_damage</code>: 攻撃力</li>
                            <li><code>generic.movement_speed</code>: 移動速度 (標準は0.1くらい)</li>
                            <li><code>generic.knockback_resistance</code>: ノックバック耐性 (1.0で不動)</li>
                        </ul>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. HPバー表示 (/bossbar)</h3>
                    <p>画面上にリッチなステータスバーを出します。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/bossbar add boss1 "魔王"</span> <span class="comment">// 作成</span><br>
                        <span class="cmd">/bossbar set boss1 players @a</span> <span class="comment">// 全員に表示</span><br>
                        <span class="cmd">/bossbar set boss1 value 100</span> <span class="comment">// 値を設定</span>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('entity_3')">試験を受ける (Exam)</button>
            </div>
             <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>裏ボス制作</strong>: 攻撃力が即死級、かつノックバックしない絶望的なゾンビを作る。</li>
                    <li><strong>超高速鬼ごっこ</strong>: 鬼のスピードを通常の1.5倍に設定する（<code>attribute ... set 0.15</code>）。</li>
                </ul>
            </div>
            `
        },

        // Phase 4: Mastery
        'master_2': {
            id: 'master_2',
            icon: '⏱️',
            title: '4-Core. Game Loops',
            sub: 'ゲームループ',
            tags: ['Schedule', 'Tick'],
            parents: ['logic_3', 'world_3', 'entity_3'],
            goal: '完全自動化',
            goalDesc: 'プレイヤーがいなくても動き続けるサーバーシステムを作ります。',
            content: `
            <div class="level-header">
                <h2>Node: Game Loops</h2>
                <span class="level-badge">達人</span>
            </div>
            <div class="level-body">
                <p class="intro-text">「1秒ごとに実行」「朝になったら実行」。時間を支配することで、プレイヤーが不在でも動くシステムを作ります。</p>
                
                <div class="lesson-section">
                    <h3>1. 予約実行 (/schedule)</h3>
                    <p>関数の実行を「未来」に飛ばします。</p>
                    <div class="syntax-box">
                        /schedule function &lt;関数名&gt; &lt;時間&gt;
                    </div>
                    <div class="code-block-demo">
                        <span class="cmd">/schedule function my_pack:reset_game 10m</span>
                        <span class="comment">// 10分後にゲームリセットを実行</span>
                    </div>
                </div>

                <div class="lesson-section">
                    <h3>2. 常時実行 (tick.json / Command Block)</h3>
                    <p>毎秒20回（1tickごと）実行し続ける処理です。</p>
                    <div class="mechanism-box" style="background:#222; padding:10px; border-left:4px solid #aaa;">
                         <h4>⚙️ 用途の違い</h4>
                         <ul>
                             <li><strong>Schedule</strong>: 「時限爆弾」や「ウェーブ戦の開始」など、1回だけ遅らせたい時。</li>
                             <li><strong>Tick</strong>: 「足元にパーティクルを出し続ける」など、常に監視したい時。</li>
                         </ul>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_2')">試験を受ける (Exam)</button>
            </div>
            <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>放置系ゲーム</strong>: <code>schedule</code> で1分ごとに「利息」としてお金が増える処理をループさせる。</li>
                    <li><strong>定期イベント</strong>: リアルタイムの毎時0分に、サーバー全体にアナウンスを流す。</li>
                </ul>
            </div>
            `
        },
        'master_3': {
            id: 'master_3',
            icon: '🖥️',
            title: '4-D1. Modern Display',
            sub: '最新鋭UI',
            tags: ['TextDisplay', 'BlockDisplay'],
            parents: ['master_2'],
            goal: 'ホログラムUI',
            goalDesc: '空中に浮かぶ文字や、回転するアイテムモデルで近未来的なUIを作ります。MODは不要です。',
            content: `
             <div class="level-header">
                <h2>Node: Modern Display</h2>
                <span class="level-badge">達人+</span>
            </div>
            <div class="level-body">
                <p class="intro-text">看板や額縁はもう古い。ディスプレイエンティティで革命を起こしましょう。自由な回転、サイズ変更、補間アニメーションが可能です。</p>
                 <div class="lesson-section">
                    <h3>1. 文字表示 (Text Display)</h3>
                    <p>空中に浮く文字を出します。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/summon text_display ~ ~1 ~ {text:'"Welcome!"', billboard:"center", background:0}</span>
                    </div>
                    <p><code>billboard:"center"</code> で常にプレイヤーの方を向かせたり、<code>background:0</code> で背景色を透明にできます。</p>
                </div>

                <div class="lesson-section">
                    <h3>2. アイテム表示 (Item Display)</h3>
                    <p>アイテムを巨大化させたり回転させたりして飾ります。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/summon item_display ~ ~ ~ {item:{id:"diamond_sword", Count:1}, transformation:{scale:[2,2,2]}}</span>
                    </div>
                </div>
            </div>
             <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_3')">試験を受ける (Exam)</button>
            </div>
            <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>ダメージポップアップ</strong>: 攻撃ヒット時に、一瞬だけダメージ数値を表示して消滅させる。</li>
                    <li><strong>3Dホログラムマップ</strong>: <code>block_display</code> を小さくして並べ、テーブルの上にミニチュアのマップを作る。</li>
                </ul>
            </div>
            `
        },
        'master_4': {
            id: 'master_4',
            icon: '🔄',
            title: '4-S1. Game State',
            sub: 'ゲーム進行管理',
            tags: ['State Machine', 'Flow'],
            parents: ['master_2'], // From Game Loops
            goal: 'ロビー機能',
            goalDesc: '「ロビー待機」「ゲーム中」「結果発表」の状態を管理し、ゲームループを切り替えます。',
            content: `
            <div class="level-header">
                <h2>Node: Game State Machine</h2>
                <span class="level-badge">達人++</span>
            </div>
            <div class="level-body">
                <p class="intro-text">ゲームには始まりと終わりがあります。「今がどういう状態か」を管理する「ステートマシン」を作りましょう。</p>
                 <div class="lesson-section">
                    <h3>1. ステート管理 (Scoreboard)</h3>
                    <p><code>game_state</code> というスコアを作り、数字で管理するのが一般的です。</p>
                    <ul class="concept-list">
                        <li><strong>0</strong>: ロビー待機 (Lobby)</li>
                        <li><strong>1</strong>: ゲーム進行中 (InGame)</li>
                        <li><strong>2</strong>: 終了・表彰式 (Ending)</li>
                    </ul>
                </div>
                 <div class="lesson-section">
                    <h3>2. ステートごとのループ切り替え</h3>
                    <p>メインループ(tick)の中で、現在のステートを見て実行する処理を変えます。</p>
                    <div class="code-block-demo">
                        <span class="cmd">execute if score global game_state matches 0 run function my_game:lobby_loop</span>
                        <span class="cmd">execute if score global game_state matches 1 run function my_game:main_loop</span>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_4')">試験を受ける (Exam)</button>
            </div>
             <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>全自動アリーナ</strong>: 「参加者が揃ったらカウントダウン」→「戦闘開始」→「一人になったら終了」→「ロビーへ戻る」の一連の流れを作る。</li>
                </ul>
            </div>
            `
        },
        'master_5': {
            id: 'master_5',
            icon: '🖱️',
            title: '4-I1. Interaction',
            sub: '高度な操作',
            tags: ['Raycast', 'Click'],
            parents: ['master_3'], // From Display
            goal: '魔法銃',
            goalDesc: '右クリック検知と視線判定(Raycast)を組み合わせ、照準の合った敵を燃やす魔法を作ります。',
            content: `
            <div class="level-header">
                <h2>Node: Interaction & Raytcasting</h2>
                <span class="level-badge">達人++</span>
            </div>
            <div class="level-body">
                <p class="intro-text">「剣で殴る」以外の操作を実現します。視線の先に何があるか判定する「レイキャスト」は上級者の必修科目です。</p>
                 <div class="lesson-section">
                    <h3>1. 右クリック検知 (Coas)</h3>
                    <p>「ニンジン付きの棒」などを使った検知方法が有名です。</p>
                    <div class="code-block-demo">
                        <span class="cmd">/scoreboard objectives add click minecraft.used:minecraft.carrot_on_a_stick</span>
                    </div>
                </div>
                 <div class="lesson-section">
                    <h3>2. 視線判定 (Raycast)</h3>
                    <p>「0.1マス前進して当たり判定を確認」を再帰的に繰り返すことで、銃のような判定を作ります。</p>
                    <div class="code-block-demo">
                        <span class="cmd"># function raycast</span><br>
                        <span class="cmd">execute if entity @e[dx=0] run function hit_effect</span><br>
                        <span class="cmd">execute unless entity @e[dx=0] positioned ^ ^ ^0.5 run function raycast</span>
                    </div>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_5')">試験を受ける (Exam)</button>
            </div>
            <div class="practical-use-box">
                <h3>🛠️ 遊び方の提案 (Ways to Play)</h3>
                <ul>
                    <li><strong>FPSゲーム</strong>: スナイパーライフルやショットガンのような武器を作る。</li>
                    <li><strong>魔法のステッキ</strong>: 遠くのスイッチを遠隔操作するパズル。</li>
                </ul>
            </div>
            `
        },
        'master_final': {
            id: 'master_final',
            icon: '👑',
            title: 'FINAL. THE CREATOR',
            sub: '創造主',
            tags: ['Game Design', 'Integration'],
            parents: ['master_4', 'master_5'],
            goal: 'オリジナルゲーム完成',
            goalDesc: 'これまでの知識を総動員し、一つの完全な「ミニゲーム」を完成させます。',
            content: `
            <div class="level-header">
                <h2>Node: THE CREATOR (Final Boss)</h2>
                <span class="level-badge">LEGEND</span>
            </div>
            <div class="level-body">
                <p class="intro-text">おめでとうございます。ここが最後の試練です。</p>
                <p class="intro-text">Logic, World, Entity, そしてMastery... 全ての知識を統合し、マイクラの中に「あなたのゲーム」を生み出してください。</p>
                 <div class="lesson-section">
                    <h3>卒業制作課題: "One Map Game"</h3>
                    <p>以下の要件を満たすゲームを作ってみましょう。</p>
                    <ul class="concept-list">
                        <li><strong>System</strong>: ロビーとゲームエリアがあり、自動で切り替わる (State Machine)</li>
                        <li><strong>Logic</strong>: スコアや通貨システムがある (Scoreboard)</li>
                        <li><strong>Visual</strong>: タイトル表示や演出がある (Display / Title)</li>
                        <li><strong>Action</strong>: 独自のアイテムやスキルがある (Interaction / Attribute)</li>
                    </ul>
                </div>
                 <div class="lesson-section">
                    <h3>設計図のヒント</h3>
                    <p>いきなり作り始めず、まずは紙に「どんな遊びか」を書き出すのが近道です。</p>
                </div>
            </div>
            <div class="lesson-footer">
                <button class="primary-btn" onclick="app.startNodeExam('master_final')">最後の試験へ (Final Exam)</button>
            </div>
            `
        }
    },

    // State Management
    state: {
        unlockedNodes: JSON.parse(localStorage.getItem('moc_unlockedNodes')) || ['basic_1'], // Strings now
        completedNodes: JSON.parse(localStorage.getItem('moc_completedNodes')) || [], // New strict completion tracking
        completedWorkshops: JSON.parse(localStorage.getItem('moc_completedWorkshops')) || [],
        workshopPoints: parseInt(localStorage.getItem('moc_workshopPoints')) || 0
    },

    // Save System
    saveState() {
        localStorage.setItem('moc_unlockedNodes', JSON.stringify(this.state.unlockedNodes));
        localStorage.setItem('moc_completedNodes', JSON.stringify(this.state.completedNodes));
        localStorage.setItem('moc_completedWorkshops', JSON.stringify(this.state.completedWorkshops));
        localStorage.setItem('moc_workshopPoints', this.state.workshopPoints);
    },

    // Logic V3.5 Strict Unlock System
    improveLevel(completedNodeId) {
        // 1. Mark as completed
        if (!this.state.completedNodes.includes(completedNodeId)) {
            this.state.completedNodes.push(completedNodeId);
        }

        // 2. Find children of this node
        const children = Object.values(this.skillTree).filter(n => n.parents.includes(completedNodeId));

        if (children.length === 0) {
            this.showToast('Course Completed! More updates coming soon.', '👑');
        } else {
            let newUnlock = false;
            children.forEach(child => {
                // Check if ALL parents are completed
                const allParentsDone = child.parents.every(pid => this.state.completedNodes.includes(pid));

                if (allParentsDone) {
                    if (!this.state.unlockedNodes.includes(child.id)) {
                        this.state.unlockedNodes.push(child.id);
                        newUnlock = true;
                    }
                }
            });

            if (newUnlock) {
                this.showToast('New Skill Node Unlocked!', '🔓');
            }
        }

        this.saveState();
        this.renderSkillTree();
        this.updateGlobalLevel();
        this.closeModal();

        // Cert Animation
        const cert = document.getElementById('certificate-overlay');
        cert.classList.remove('hidden');
        setTimeout(() => cert.classList.add('hidden'), 1000);
    },

    // Stub for exam
    startNodeExam(nodeId) {
        if (confirm("試験を開始しますか？(現在はテスト用に即合格扱いになります)")) {
            this.improveLevel(nodeId);
        }
    },
    // V11.5 Global Level System (Needs adaptation for skill tree)
    // V11.5 Global Level System
    updateGlobalLevel() {
        // Base Level = 1 + (Completed Nodes / 2)
        const completedCount = this.state.completedNodes.length;
        const mapLevel = 1 + Math.floor(completedCount / 2);

        // Workshop Bonus = +1 Level per 2 Workshops completed
        const workshopBonus = Math.floor(this.state.completedWorkshops.length / 2);

        const totalLevel = Math.min(99, mapLevel + workshopBonus);
        this.state.currentLevel = totalLevel; // Cache for other views

        // Update UI
        const label = document.getElementById('current-level-label');
        if (label) label.innerText = totalLevel;

        const titleLabel = document.getElementById('current-level-name');
        if (titleLabel) titleLabel.innerText = this.getLevelTitle(totalLevel);

        // Progress Bar Calculation (Approx 20 nodes for max visual)
        const progressPct = Math.min(100, (completedCount / 20) * 100);
        const bar = document.querySelector('.progress-fill');
        if (bar) bar.style.width = `${progressPct}%`;

        return totalLevel;
    },

    getLevelTitle(level) {
        const titles = [
            'Novice', 'Apprentice', 'Logic User', 'Engineer',
            'Wizard', 'Architect', 'Grandmaster', 'Game Master',
            'Legend', 'Myth', 'Deity', 'The Command'
        ];
        // Return title based on level (1-index based array mapping)
        // Level 1 = Novice
        return titles[level - 1] || `Level ${level} User`;
    },

    resetState() {
        if (confirm('本当に進捗をリセットしますか？ (Are you sure you want to reset all progress?)')) {
            localStorage.clear();
            location.reload();
        }
    },

    // Helper to check if a node is unlocked
    checkUnlock(nodeId) {
        return this.state.unlockedNodes.includes(nodeId);
    },

    // Helper to check if a node is unlocked but not yet completed (i.e., the current task)
    isNextNode(nodeId) {
        return this.state.unlockedNodes.includes(nodeId) && !this.state.completedNodes.includes(nodeId);
    },

    // Mock Database of Commands (V2 Expansion - 50+ Commands)
    commandDB: [
        // World Management
        { name: '/time', desc: '時間を変更する', syntax: '/time set <value>', category: 'World' },

        { name: '/weather', desc: '天候を変更する', syntax: '/weather <type> [duration]', category: 'World' },
        { name: '/difficulty', desc: '難易度を変更する', syntax: '/difficulty <peaceful|easy|normal|hard>', category: 'World' },
        { name: '/gamerule', desc: 'ゲームのルールを変更する', syntax: '/gamerule <rule> <value>', category: 'World' },
        { name: '/worldborder', desc: 'ワールドの境界線を設定する', syntax: '/worldborder set <size>', category: 'World' },
        { name: '/seed', desc: 'ワールドのシード値を表示', syntax: '/seed', category: 'World' },
        { name: '/setworldspawn', desc: 'ワールドの初期スポーン地点を設定', syntax: '/setworldspawn [pos]', category: 'World' },

        // Player Management
        { name: '/gamemode', desc: 'ゲームモードを変更する', syntax: '/gamemode <mode> [target]', category: 'Player' },
        { name: '/give', desc: 'アイテムを与える', syntax: '/give <target> <item> [amount]', category: 'Player' },
        { name: '/clear', desc: 'アイテムを消去する', syntax: '/clear [target] [item]', category: 'Player' },
        { name: '/xp', desc: '経験値を与える/減らす', syntax: '/xp add <target> <amount> [levels]', category: 'Player' },
        { name: '/spawnpoint', desc: '個人のスポーン地点を設定', syntax: '/spawnpoint [target] [pos]', category: 'Player' },
        { name: '/op', desc: 'オペレーター権限を与える', syntax: '/op <player>', category: 'Player' },
        { name: '/deop', desc: 'オペレーター権限を剥奪する', syntax: '/deop <player>', category: 'Player' },
        { name: '/kick', desc: 'プレイヤーをキックする', syntax: '/kick <target> [reason]', category: 'Player' },
        { name: '/ban', desc: 'プレイヤーをBANする', syntax: '/ban <target> [reason]', category: 'Player' },

        // Entity Management
        { name: '/tp', desc: 'テレポートさせる', syntax: '/tp <target> <location>', category: 'Entity' },
        { name: '/kill', desc: 'エンティティを殺す', syntax: '/kill <target>', category: 'Entity' },
        { name: '/summon', desc: 'エンティティを召喚する', syntax: '/summon <entity> [pos] [nbt]', category: 'Entity' },
        { name: '/effect', desc: 'ポーション効果の操作', syntax: '/effect give <target> <effect> [seconds] [amp]', category: 'Entity' },
        { name: '/attribute', desc: 'エンティティの属性を変更', syntax: '/attribute <target> <attribute> get|set ...', category: 'Entity' },
        { name: '/enchant', desc: '手に持ったアイテムにエンチャント', syntax: '/enchant <target> <enchantment> [level]', category: 'Entity' },

        // Block & Area
        { name: '/fill', desc: '指定範囲をブロックで埋める', syntax: '/fill <from> <to> <block>', category: 'Block' },
        { name: '/setblock', desc: '指定位置にブロックを置く', syntax: '/setblock <pos> <block>', category: 'Block' },
        { name: '/clone', desc: 'ブロックをコピーして移動', syntax: '/clone <begin> <end> <dest>', category: 'Block' },
        { name: '/particle', desc: 'パーティクルを表示', syntax: '/particle <name> [pos]', category: 'Block' },
        { name: '/playsound', desc: '音を鳴らす', syntax: '/playsound <sound> <source> <target>', category: 'Block' },

        // Logic & Scoreboard
        { name: '/scoreboard', desc: 'スコア(変数)の管理', syntax: '/scoreboard objectives|players ...', category: 'Logic' },
        { name: '/tag', desc: 'タグ(メタデータ)の管理', syntax: '/tag <target> add|remove <name>', category: 'Logic' },
        { name: '/team', desc: 'チームの管理', syntax: '/team add <name>', category: 'Logic' },
        { name: '/trigger', desc: 'トリガーを作動させる', syntax: '/trigger <objective>', category: 'Logic' },
        { name: '/bossbar', desc: 'ボスバーを表示/操作', syntax: '/bossbar add <id> <name>', category: 'Logic' },
        { name: '/advancement', desc: '進捗の操作', syntax: '/advancement grant <target> only <id>', category: 'Logic' },

        // Advanced Execution
        { name: '/execute', desc: '高度な条件付実行', syntax: '/execute if|as|at ... run ...', category: 'Advanced' },
        { name: '/data', desc: 'NBTデータの取得・変更', syntax: '/data get|merge|modify ...', category: 'Advanced' },
        { name: '/function', desc: '関数ファイル(.mcfunction)を実行', syntax: '/function <namespace:name>', category: 'Advanced' },
        { name: '/schedule', desc: '関数の実行を予約', syntax: '/schedule function <name> <time>', category: 'Advanced' },
        { name: '/forceload', desc: 'チャンクを常時読み込みにする', syntax: '/forceload add <from> [to]', category: 'Advanced' },
        { name: '/reload', desc: 'データパックを再読み込み', syntax: '/reload', category: 'Advanced' },

        // Chat & Communication
        { name: '/say', desc: '全員にメッセージを送る', syntax: '/say <message>', category: 'Chat' },
        { name: '/tellraw', desc: '装飾されたJSONメッセージを送る', syntax: '/tellraw <target> <json>', category: 'Chat' },
        { name: '/title', desc: '画面中央にタイトルを表示', syntax: '/title <target> title <json>', category: 'Chat' },
        { name: '/msg', desc: '個別にささやく', syntax: '/msg <target> <message>', category: 'Chat' },
        { name: '/me', desc: 'アクションメッセージ', syntax: '/me <action>', category: 'Chat' },
        { name: '/list', desc: '接続中のプレイヤーを表示', syntax: '/list', category: 'Chat' }
    ],

    init() {
        console.log('M.o.C. V3 Ultimate Initialized');
        this.bindEvents();
        if (this.loadState) this.loadState();

        // V3.5 Migration: Fix missing completedNodes if upgrading from V2/V3
        // If user has unlocked nodes but completedNodes is empty, infer completion from unlock status.
        if (this.state.completedNodes.length === 0 && this.state.unlockedNodes.length > 1) {
            console.log('Migrating legacy state to V3.5...');
            const inferred = new Set(this.state.completedNodes);

            this.state.unlockedNodes.forEach(uid => {
                const node = this.skillTree[uid];
                if (node && node.parents) {
                    node.parents.forEach(pid => inferred.add(pid));
                }
            });

            // Special Case: basic_1 is always completed if basic_2 is unlocked
            if (this.state.unlockedNodes.includes('basic_2')) inferred.add('basic_1');

            this.state.completedNodes = Array.from(inferred);
            this.saveState();
        }

        this.renderSkillTree();
        this.renderWorkshopList();
        this.updateGlobalLevel();
    },

    highlightCurrentLevel() {
        const nodes = document.querySelectorAll('.map-node');
        const maxLevel = Math.max(...this.state.unlockedLevels);

        nodes.forEach((node, index) => {
            const level = index + 1;
            if (level === maxLevel) {
                node.classList.add('current');
            } else {
                node.classList.remove('current');
            }
        });
    },

    bindEvents() {
        // Modal close on outside click
        document.getElementById('level-modal').addEventListener('click', (e) => {
            if (e.target.id === 'level-modal') this.closeModal();
        });
    },

    // ... (Navigation methods unchanged) ...

    // --- Workshop Logic ---

    // ... (renderStep, etc unchanged) ...

    renderChallenge(data) {
        // V7: Challenge Screen
        document.getElementById('ws-progress').style.width = '100%';
        const contentDiv = document.getElementById('ws-content');
        const chal = data.challenge || { title: 'Completion', desc: 'Good job!', hint: '' };

        contentDiv.innerHTML = `
                                                                                                                                                            <div class="challenge-box">
                                                                                                                                                                <div class="challenge-title">💪 Next Challenge: ${chal.title}</div>
                                                                                                                                                                <div class="challenge-desc">${chal.desc}</div>
                                                                                                                                                                <div class="challenge-hint">${chal.hint}</div>
                                                                                                                                                            </div>
                                                                                                                                                            `;

        document.getElementById('step-count').innerText = 'Challenge Phase';
        const nextBtn = document.getElementById('btn-next');
        nextBtn.innerText = 'Complete & Close';
        nextBtn.onclick = () => app.completeWorkshop(); // Changed to completeWorkshop
    },

    completeWorkshop() {
        const { activeId } = this.workshopState;
        if (activeId && !this.state.completedWorkshops.includes(activeId)) {
            this.state.completedWorkshops.push(activeId);
            this.state.completedWorkshops.sort();
            this.saveState();

            this.updateGlobalLevel();
            this.showToast('Workshop Completed! Global Level XP +', '🎖️');
        }
        this.closeWorkshop();
    },

    // --- Navigation ---
    switchTab(tabId) {
        // Nav Items UI
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.dataset.tab === tabId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Content UI
        document.querySelectorAll('.view-section').forEach(section => {
            if (section.id === tabId) section.classList.add('active');
            else section.classList.remove('active');
        });

        this.state.currentTab = tabId;

        // V5: ID Dictionary Init
        if (tabId === 'iddict') {
            this.renderIdDictionary();
        } else if (tabId === 'reference') {
            this.searchCommands();
        }
    },

    // --- Skill Tree Rendering (V3) ---
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            const toast = document.createElement('div');
            toast.className = 'toast-msg';
            toast.textContent = 'Command Copied! 📋';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        } catch (err) {
            console.error('Failed to copy keys: ', err);
        }
    },

    renderSkillTree() {
        const container = document.getElementById('map-container');
        container.innerHTML = '';

        // V3.5 Layout: Phase 1 (Single) -> Phase 2 (Split 3: Logic, Entity, World) -> Phase 3 (Advanced) -> Phase 4 (Mastery)
        container.innerHTML = `
            <div class="tree-phase" id="phase-1"></div>
            <div class="tree-phase split-phase" id="phase-2">
                <div class="tree-branch" id="branch-logic"></div>
                <div class="tree-branch branch-entity" id="branch-entity"></div>
                <div class="tree-branch" id="branch-world"></div>
            </div>
            <div class="tree-phase split-phase" id="phase-3">
                 <div class="tree-branch" id="branch-logic-adv"></div>
                 <div class="tree-branch branch-entity" id="branch-entity-adv"></div>
                 <div class="tree-branch" id="branch-world-adv"></div>
            </div>
            <div class="tree-phase" id="phase-4"></div>
            <div class="tree-phase" id="phase-final"></div>
        `;

        const phase1 = document.getElementById('phase-1');
        const branchLogic = document.getElementById('branch-logic');
        const branchEntity = document.getElementById('branch-entity'); // New!
        const branchWorld = document.getElementById('branch-world');

        const branchLogicAdv = document.getElementById('branch-logic-adv');
        const branchEntityAdv = document.getElementById('branch-entity-adv');
        const branchWorldAdv = document.getElementById('branch-world-adv');

        const phase4 = document.getElementById('phase-4');
        const phaseFinal = document.getElementById('phase-final');

        const nodes = Object.values(this.skillTree);

        nodes.forEach(node => {
            const isUnlocked = this.checkUnlock(node.id);
            const isNext = this.isNextNode(node.id);
            const isCompleted = isUnlocked && !isNext;

            const div = document.createElement('div');
            div.className = `map-node ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} ${isNext ? 'current' : ''}`;
            if (isUnlocked) {
                div.onclick = () => this.openNode(node.id);
            }

            // Icons
            const iconChar = node.icon || '📦';

            // Status Logic
            let statusBadge = '';
            if (isCompleted) statusBadge = '<div class="status-badge done">✅</div>';
            else if (!isUnlocked) statusBadge = '<div class="status-badge locked">🔒</div>';

            div.innerHTML = `
                <div class="node-icon-wrapper">
                    <div class="node-icon">${iconChar}</div>
                    ${statusBadge}
                </div>
                <div class="node-info">
                    <div class="node-header">
                        <h3>${node.title}</h3>
                    </div>
                    <div class="node-goal-row">
                        <span class="goal-label">GOAL</span>
                        <span class="node-goal">${node.goal}</span>
                    </div>
                    <div class="node-tags">
                        ${node.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                </div>
            `;

            // Assign to container based on ID pattern
            if (node.id.startsWith('basic')) {
                phase1.appendChild(div);
            } else if (node.id.startsWith('logic')) {
                if (node.id.includes('3')) branchLogicAdv.appendChild(div);
                else branchLogic.appendChild(div);
            } else if (node.id.startsWith('world')) {
                if (node.id.includes('3')) branchWorldAdv.appendChild(div);
                else branchWorld.appendChild(div);
            } else if (node.id.startsWith('entity')) {
                if (node.id.includes('3')) branchEntityAdv.appendChild(div);
                else branchEntity.appendChild(div);
            } else if (node.id.startsWith('master')) {
                if (node.id === 'master_1') {
                    // Phase 3 Convergence (Mid-Boss)
                    // Create a wrapper phase for alignment
                    const masterPhase = document.createElement('div');
                    masterPhase.className = 'tree-phase';
                    masterPhase.id = 'phase-master-1';
                    masterPhase.style.margin = '0 auto'; // Let gap handle spacing? No, phases have gaps in container.

                    // Master 1 Node
                    div.id = 'master_1'; // Ensure ID matches for CSS selectors

                    masterPhase.appendChild(div);

                    // Insert BEFORE Phase 3 container
                    container.insertBefore(masterPhase, document.getElementById('phase-3'));

                    // No need for extra styles since wrapper handles layout

                } else {
                    if (node.id === 'master_final') {
                        // Final Boss
                        div.classList.add('node-final-boss'); // For special styling
                        phaseFinal.appendChild(div);
                    } else {
                        phase4.appendChild(div);
                    }
                }
            } else {
                phase1.appendChild(div);
            }
        });
    },

    getParentTitles(parentIds) {
        return parentIds.map(pid => this.skillTree[pid].title).join(', ');
    },

    checkUnlock(nodeId) {
        // Unlocked if in array
        if (this.state.unlockedNodes.includes(nodeId)) return true;
        // OR if all parents are completed? 
        // Logic: A node is "Unlockable" if its parents are in unlockedNodes.
        // But here 'unlockedNodes' implies "Completed" effectively in the old logic?
        // Let's refine: "unlockedNodes" = Completed & Available?
        // Let's say: 
        // 1. You start with 'basic_1' in unlockedNodes.
        // 2. When you finish 'basic_1', you add child nodes to unlockedNodes?
        //    OR you keep 'unlockedNodes' as 'CompletedNodes'.
        // Let's change state.unlockedNodes -> state.completedNodes for clarity?
        // But user data migration might be tricky. Let's stick to "unlockedNodes" meaning "Available or Completed".

        const node = this.skillTree[nodeId];
        if (!node) return false;
        if (node.parents.length === 0) return true; // Root is always visible/unlockable event if not processed?
        // Actually, simpler:
        // A node is visible/interactive if it is IS in unlockedNodes.
        // We add new nodes to unlockedNodes when parent is done.
        return this.state.unlockedNodes.includes(nodeId);
    },

    isNextNode(nodeId) {
        // It is "Next" (Current challenge) if it is Unlocked BUT doesn't have children unlocked?
        // Or simply if it is the latest added?
        // For visual highlight, let's say "Unlocked" but "Not all children unlocked"?
        // For now simplest: It is the last one in the unlockedNodes list? No, branching.
        // Let's just highlight all "Leaf" nodes in the unlocked graph.
        if (!this.state.unlockedNodes.includes(nodeId)) return false;

        // If I have children that are ALSO unlocked, then I am likely "Done".
        // Find children
        const children = Object.values(this.skillTree).filter(n => n.parents.includes(nodeId));
        const hasUnlockedChild = children.some(c => this.state.unlockedNodes.includes(c.id));

        return !hasUnlockedChild;
    },

    hasCompletedChildren(nodeId) {
        const children = Object.values(this.skillTree).filter(n => n.parents.includes(nodeId));
        return children.some(c => this.state.unlockedNodes.includes(c.id));
    },

    openNode(nodeId) {
        const node = this.skillTree[nodeId];
        const modal = document.getElementById('level-modal');
        const content = document.getElementById('level-content-area');
        content.innerHTML = node.content; // Use node content
        modal.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('level-modal').classList.add('hidden');
    },

    // --- State Management ---
    loadState() {
        const s = localStorage.getItem('moc_v2_state');
        if (s) {
            const parsed = JSON.parse(s);
            this.state = { ...this.state, ...parsed };

            // Migration V2->V3 (Number -> Strings)
            if (this.state.unlockedLevels) {
                // Map old levels to new IDs
                const mapping = ['basic_1', 'basic_2', 'basic_3', 'logic_1', 'world_1', /*...*/];
                // Simple migration: if level 2 is max, unlock basic_1, basic_2.
                const max = Math.max(...this.state.unlockedLevels);
                this.state.unlockedNodes = [];
                if (max >= 1) this.state.unlockedNodes.push('basic_1');
                if (max >= 2) this.state.unlockedNodes.push('basic_2');
                if (max >= 3) this.state.unlockedNodes.push('basic_3');
                if (max >= 4) {
                    this.state.unlockedNodes.push('logic_1'); // Assume logic path for legacy
                    this.state.unlockedNodes.push('world_1');
                }

                delete this.state.unlockedLevels;
                delete this.state.userLevel;
                this.saveState();
            }
        }
    },

    saveState() {
        localStorage.setItem('moc_v2_state', JSON.stringify(this.state));
    },

    improveLevel(completedNodeId) {
        // Completed a node.
        // 1. Find children of this node.
        // 2. Unlock them.

        const children = Object.values(this.skillTree).filter(n => n.parents.includes(completedNodeId));

        if (children.length === 0) {
            this.showToast('Project Completed! (More nodes coming soon)', '👑');
        } else {
            let newUnlock = false;
            children.forEach(child => {
                if (!this.state.unlockedNodes.includes(child.id)) {
                    this.state.unlockedNodes.push(child.id);
                    newUnlock = true;
                }
            });

            if (newUnlock) {
                this.showToast('New Skill Node Unlocked!', '🔓');
            }
        }

        this.saveState();
        this.renderSkillTree();
        this.updateGlobalLevel();

        // Close modal
        this.closeModal();

        // Cert Animation
        const cert = document.getElementById('certificate-overlay');
        cert.classList.remove('hidden');
        setTimeout(() => cert.classList.add('hidden'), 1000);
    },

    // Stub for exam
    // Updated for V4: Real Exams
    startNodeExam(nodeId) {
        const exam = this.nodeExams[nodeId];

        if (exam) {
            // Real Exam
            this.examState.activeLevel = nodeId; // Use nodeId as ID
            this.examState.answers = {};
            this.examState.currentQuestions = exam.questions;

            this.showExamModal();
        } else {
            // Fallback for nodes without exams yet
            if (confirm("試験を開始しますか？(現在はテスト用に即合格扱いになります)")) {
                this.improveLevel(nodeId);
            }
        }
    },

    // --- Legacy Reference Tab Support ---
    renderCommandList(list) {
        // Used for Reference Tab
        const listEl = document.getElementById('command-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        // Restore commandDB usage if passed
        if (!list) return;

        list.forEach(item => {
            const div = document.createElement('div');
            div.className = 'command-item';
            div.innerHTML = `
                                                                                                                                                            <div class="cmd-main">${item.name}</div>
                                                                                                                                                            <div class="cmd-desc">${item.desc}</div>
                                                                                                                                                            <button class="copy-btn" onclick="app.copyCode('${item.name}')">Copy</button>
                                                                                                                                                            `;
            listEl.appendChild(div);
        });
    },

    // --- Certification Exam System (V11) ---
    examState: {
        activeLevel: null,
        answers: {}, // {qIndex: optionIndex }
        currentQuestions: []
    },

    // --- Consolidated Exam System (V4) ---
    nodeExams: {
        // Phase 1: Foundation
        'basic_1': { // Hello World
            questions: [
                { q: "全員にメッセージを送るコマンドは？", options: ["/tell", "/say", "/msg"], a: 1 },
                { q: "画面中央に文字を表示するのは？", options: ["/title", "/sign", "/display"], a: 0 },
                { q: "コマンドの始まりの記号は？", options: ["!", "#", "/"], a: 2 }
            ]
        },
        'basic_2': { // Coordinates
            questions: [
                { q: "テレポートするコマンドは？", options: ["/tp", "/warp", "/move"], a: 0 },
                { q: "今の場所を表す記号は？", options: ["^", "~", "*"], a: 1 },
                { q: "高さ(Y座標)は真ん中？", options: ["はい (X Y Z)", "いいえ (X Z Y)", "関係ない"], a: 0 }
            ]
        },
        'basic_3': { // Selectors
            questions: [
                { q: "「全てのプレイヤー」を表すセレクターは？", options: ["@p", "@a", "@e"], a: 1 },
                { q: "自分自身を表すセレクターは？", options: ["@me", "@i", "@s"], a: 2 },
                { q: "半径5マス以内を指定するのは？", options: ["distance=..5", "range=5", "r=5"], a: 0 }
            ]
        },
        'basic_4': { // Items
            questions: [
                { q: "アイテムを与えるコマンドは？", options: ["/get", "/give", "/item"], a: 1 },
                { q: "アイテムを没収するコマンドは？", options: ["/delete", "/remove", "/clear"], a: 2 },
                { q: "1スタックの個数は基本いくつ？", options: ["100", "50", "64"], a: 2 }
            ]
        },

        // Phase 2: Split Paths
        'logic_1': { // Scoreboard Basic
            questions: [
                { q: "スコアボードを作成するコマンドは？", options: ["/scoreboard objectives add ...", "/scoreboard players add ...", "/var create ..."], a: 0 },
                { q: "スコアボードのタイプ「dummy」の意味は？", options: ["馬鹿な", "コマンドでのみ変更可能", "テスト用"], a: 1 },
                { q: "プレイヤーにポイントを加算するには？", options: ["/scoreboard players set", "/scoreboard players add", "/scoreboard players give"], a: 1 }
            ]
        },
        'logic_1_5': { // Operations
            questions: [
                { q: "スコア同士を足し合わせるサブコマンドは？", options: ["math", "calc", "operation"], a: 2 },
                { q: "Score A に Score B を代入する記号は？", options: ["+=", "=", "<"], a: 1 },
                { q: "自分自身のスコアを参照するセレクターは？", options: ["@s", "@self", "@me"], a: 0 }
            ]
        },
        'logic_2': { // Tags & Teams
            questions: [
                { q: "プレイヤーにタグを付けるコマンドは？", options: ["/tag add", "/tag set", "/player tag"], a: 0 },
                { q: "特定のタグを持つ人だけを対象にするには？", options: ["@a[tag=NAME]", "@a[name=NAME]", "@a[has=NAME]"], a: 0 },
                { q: "チームの色を変更するコマンドは？", options: ["/team color", "/team modify ... color", "/team set color"], a: 1 }
            ]
        },

        'world_1': { // World Control
            questions: [
                { q: "夜にするコマンドは？", options: ["/time set night", "/weather night", "/sleep"], a: 0 },
                { q: "天気を晴れにするには？", options: ["/weather sun", "/weather clear", "/rain stop"], a: 1 },
                { q: "ゲームルールを設定するコマンドは？", options: ["/rule", "/setrule", "/gamerule"], a: 2 }
            ]
        },
        'world_1_5': { // World FX
            questions: [
                { q: "パーティクルを表示するコマンドは？", options: ["/effect", "/particle", "/visual"], a: 1 },
                { q: "音を鳴らすコマンドは？", options: ["/sound", "/music", "/playsound"], a: 2 },
                { q: "音の発生源「master」の意味は？", options: ["主音量", "BGM", "環境音"], a: 0 }
            ]
        },
        'world_2': { // Copy & Paste
            questions: [
                { q: "建築をコピーするコマンドは？", options: ["/copy", "/clone", "/paste"], a: 1 },
                { q: "Cloneコマンドで必要な座標の数は？", options: ["2つ", "3つ (始点・終点・貼付先)", "4つ"], a: 1 },
                { q: "建築を保存・読込するブロックは？", options: ["コマンドブロック", "ストラクチャーブロック", "コピーブロック"], a: 1 }
            ]
        },

        'entity_1': { // Summoning Arts
            questions: [
                { q: "ゾンビを召喚するコマンドは？", options: ["/spawn", "/summon", "/create"], a: 1 },
                { q: "今の場所に召喚する座標は？", options: ["0 0 0", "~ ~ ~", "^ ^ ^"], a: 1 },
                { q: "子供の村人を召喚するNBTは？", options: ["{Baby:true}", "{Age:-20000}", "{Child:1}"], a: 1 }
            ]
        },
        'entity_2': { // Equipment & NBT
            questions: [
                { q: "装備を指定するNBTタグは？", options: ["Equipment", "Items", "ArmorItems"], a: 2 },
                { q: "手に持っているアイテムは？", options: ["HandItems", "MainHand", "Hands"], a: 0 },
                { q: "名前を表示し続けるタグは？", options: ["CustomNameVisible:1b", "ShowName:true", "Visible:1"], a: 0 }
            ]
        },

        // Phase 3 & 4
        'master_1': { // The Execute
            questions: [
                { q: "実行者を変更する execute のサブコマンドは？", options: ["at", "as", "by"], a: 1 },
                { q: "実行場所を変更する execute のサブコマンドは？", options: ["at", "in", "positioned"], a: 0 },
                { q: "足元が金ブロックなら実行する条件文は？", options: ["if block ~ ~-1 ~ gold_block", "if gold_block", "detect gold"], a: 0 }
            ]
        },
        'logic_3': { // Functions
            questions: [
                { q: "データストレージを操作するコマンドは？", options: ["/data", "/nbt", "/var"], a: 0 },
                { q: "Function内からFunctionを呼び出せる？", options: ["できない", "できる (再帰可能)", "1回だけ"], a: 1 },
                { q: "エンティティのデータを取得するには？", options: ["/data get entity", "/data read", "/nbt get"], a: 0 }
            ]
        },
        'world_3': { // Structures
            questions: [
                { q: "自然生成される構造物を作るブロックは？", options: ["ジグソーブロック", "パズルブロック", "ストラクチャーヴォイド"], a: 0 },
                { q: "ストラクチャーブロックの最大サイズは？", options: ["32x32x32", "48x48x48", "64x64x64"], a: 1 },
                { q: "空気ブロックを上書きしないモードは？", options: ["replace", "masked", "destroy"], a: 1 }
            ]
        },
        'entity_3': { // Attributes
            questions: [
                { q: "ステータスを変更するコマンドは？", options: ["/stat", "/attribute", "/status"], a: 1 },
                { q: "画面上にボスバーを表示するのは？", options: ["/bossbar", "/hpbar", "/display bar"], a: 0 },
                { q: "移動速度を表すAttribute名は？", options: ["generic.movement_speed", "speed", "player.walk"], a: 0 }
            ]
        },
        'master_2': { // Game Loops
            questions: [
                { q: "毎ティック実行される関数タグは？", options: ["#minecraft:tick", "#minecraft:load", "#minecraft:run"], a: 0 },
                { q: "タイマー処理を作る一般的な方法は？", options: ["スコアボード加算", "遅延リピーター", "チャット欄"], a: 0 },
                { q: "ロード時に一度だけ実行するタグは？", options: ["#minecraft:load", "#minecraft:init", "#start"], a: 0 }
            ]
        },
        'master_3': { // The Display
            questions: [
                { q: "アイテムを浮遊表示させるエンティティは？", options: ["armor_stand", "item_display", "floating_item"], a: 1 },
                { q: "空中に文字を表示できるエンティティは？", options: ["text_display", "sign", "hologram"], a: 0 },
                { q: "サイズを変えるNBTは？", options: ["Size", "Scale", "Zoom"], a: 1 }
            ]
        },
        'master_4': { // Game State
            questions: [
                { q: "ゲームの状態管理に便利な変数は？", options: ["game_state", "time", "player_count"], a: 0 },
                { q: "特定のスコアを持つ時だけ実行する条件は？", options: ["if score ... matches", "if var ... is", "check score ..."], a: 0 },
                { q: "ゲーム開始→終了→〇〇？ 次のフェーズは？", options: ["削除", "リセット(ロビー)", "無限ループ"], a: 1 }
            ]
        },
        'master_5': { // Raycast
            questions: [
                { q: "右クリック検知によく使われるアイテムは？", options: ["棒", "人参付きの棒", "剣"], a: 1 },
                { q: "視線の先に少しずつ進んで判定する技術を何と呼ぶ？", options: ["レイキャスティング", "ビームサーチ", "ステップ実行"], a: 0 },
                { q: "ローカル座標で「前」を表す軸は？", options: ["+Z", "-Z (^ ^ ^1)", "Y"], a: 1 }
            ]
        },
        'master_final': { // THE CREATOR
            questions: [
                { q: "ゲーム作りに一番大切なことは？", options: ["複雑なコマンド", "楽しむ心と設計図", "PCのスペック"], a: 1 },
                { q: "複数の処理をまとめるのに最適な機能は？", options: ["ファンクション (Functions)", "チャット", "看板"], a: 0 },
                { q: "あなたはプロのコマンダーですか？", options: ["はい", "Yes", "Of Course"], a: 0 }
            ]
        }
    },

    startNodeExam(nodeId) {
        const exam = this.nodeExams[nodeId];

        if (exam) {
            this.examState.activeLevel = nodeId;
            this.examState.answers = {};
            this.examState.currentQuestions = exam.questions;

            this.showExamModal();
        } else {
            console.error('Exam data missing for:', nodeId);
            // Fallback for missing exams
            if (confirm("試験データが見つかりません。とりあえず合格にしますか？")) {
                this.improveLevel(nodeId);
            }
        }
    },

    showExamModal() {
        const modal = document.getElementById('exam-modal');
        const content = document.getElementById('exam-questions');
        modal.classList.remove('hidden');

        content.innerHTML = this.examState.currentQuestions.map((q, i) => `
            <div class="exam-question">
                <p class="exam-q-text">Q${i + 1}. ${q.q}</p>
                <div class="exam-options">
                    ${q.options.map((opt, optIndex) => `
                        <button class="exam-opt-btn" onclick="app.selectOption(${i}, ${optIndex}, this)">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    selectOption(qIndex, optIndex, btn) {
        this.examState.answers[qIndex] = optIndex;

        // UI Feedback
        const parent = btn.parentElement;
        parent.querySelectorAll('.exam-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    },

    checkExam() {
        const { activeLevel, answers, currentQuestions } = this.examState;
        let correctCount = 0;

        currentQuestions.forEach((q, i) => {
            if (answers[i] === q.a) correctCount++;
        });

        if (correctCount === currentQuestions.length) {
            // Pass
            this.closeExamModal();
            this.improveLevel(activeLevel); // Add level up logic
        } else {
            // Fail
            this.showToast(`不合格... (${correctCount}/${currentQuestions.length}) もう一度挑戦！`, '❌');
            // Reset answers UI? Or keep them? Let's keep them for review but maybe shake the modal
            const modalContent = document.querySelector('.exam-modal-content');
            modalContent.classList.add('shake');
            setTimeout(() => modalContent.classList.remove('shake'), 500);
        }
    },

    closeExamModal() {
        document.getElementById('exam-modal').classList.add('hidden');
    },

    getLevelContent(levelId) {
        // V11: Authentic Educational Content & Exams
        const contents = {
            1: `
    < div class="level-header" >
                                                                                                                                                                <h2>Level 1: Novice - 世界の制御</h2>
                                                                                                                                                                <span class="level-badge">基礎</span>
                                                                                                                                                            </div >
                                                                                                                                                            <div class="goal-section">
                                                                                                                                                                <h3>🎯 目標: 撮影スタジオ (World Setup)</h3>
                                                                                                                                                                <p>【RPG開発 Phase 1: 世界】<br>まずは冒険の舞台を作ります。天候と時間を固定し、常に美しい「異世界」を構築しましょう。</p>
                                                                                                                                                            </div>
                                                                                                                                                            <div class="level-body">
                                                                                                                                                                <p class="intro-text">コマンドは、Minecraftの世界を支配するための「呪文」です。まずは神の力である「時間」と「天候」を操りましょう。</p>

                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                    <h3>1. 時間制御 (Time)</h3>
                                                                                                                                                                    <div class="concept-viz time-viz">
                                                                                                                                                                        <span style="font-size:2rem;">☀️</span> 0 (Dawn) &rarr; <span style="font-size:2rem;">🕛</span> 6000 (Noon) &rarr; <span style="font-size:2rem;">🌙</span> 13000 (Night)
                                                                                                                                                                    </div>
                                                                                                                                                                    <p>マイクラの1日は <strong>24000 tick</strong> (20分) です。コマンドでは時刻を数値、またはキーワードで指定します。</p>
                                                                                                                                                                    <div class="code-block-demo">
                                                                                                                                                                        <span class="cmd">/time set day</span> <span class="comment">// 1000 (朝)</span><br>
                                                                                                                                                                            <span class="cmd">/time set night</span> <span class="comment">// 13000 (夜)</span><br>
                                                                                                                                                                                <span class="cmd">/time set 18000</span> <span class="comment">// (深夜)</span>
                                                                                                                                                                            </div>
                                                                                                                                                                    </div>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>2. 天候制御 (Weather)</h3>
                                                                                                                                                                        <p>雨はFPSを下げる原因にもなります。開発中は常に晴れにしておくのが定石です。</p>
                                                                                                                                                                        <div class="code-block-demo">
                                                                                                                                                                            <span class="cmd">/weather clear</span> <span class="comment">// 晴れにする</span><br>
                                                                                                                                                                                <span class="cmd">/weather rain</span> <span class="comment">// 雨を降らす</span>
                                                                                                                                                                        </div>
                                                                                                                                                                        <div class="pro-tip">
                                                                                                                                                                            <strong>💡 Pro Tip:</strong><br>
                                                                                                                                                                                <code>/gamerule doWeatherCycle false</code> と入力すると、天気が勝手に変わらなくなります。常時晴れの世界を作れます。
                                                                                                                                                                        </div>
                                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="lesson-footer">
                                                                                                                                                                    <button class="primary-btn" onclick="app.startExam(1)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                </div>
                                                                                                                                                                `,
            2: `
                                                                                                                                                                <div class="level-header">
                                                                                                                                                                    <h2>Level 2: Apprentice - ターゲットと座標</h2>
                                                                                                                                                                    <span class="level-badge">応用</span>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="goal-section">
                                                                                                                                                                    <h3>🎯 目標: テレポートハブ (Lobby System)</h3>
                                                                                                                                                                    <p>【RPG開発 Phase 1: 世界】<br>世界ができたら、プレイヤーを各エリア（街、ダンジョン、闘技場）へ転送する「ロビー」機能を実装します。</p>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="level-body">
                                                                                                                                                                    <p class="intro-text">コマンドの「誰に」「どこで」を決める最も重要な概念です。</p>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>1. ターゲットセレクター (Target Selector)</h3>
                                                                                                                                                                        <table class="data-table">
                                                                                                                                                                            <tr><th>セレクター</th><th>対象</th><th>覚え方</th></tr>
                                                                                                                                                                            <tr><td><code>@p</code></td><td>最寄りの人</td><td><strong>P</strong>earest (Nearest)</td></tr>
                                                                                                                                                                            <tr><td><code>@a</code></td><td>全員</td><td><strong>A</strong>ll</td></tr>
                                                                                                                                                                            <tr><td><code>@r</code></td><td>ランダム</td><td><strong>R</strong>andom</td></tr>
                                                                                                                                                                            <tr><td><code>@e</code></td><td>全エンティティ</td><td><strong>E</strong>ntity  (動物・敵・アイテム・額縁など全て)</td></tr>
                                                                                                                                                                            <tr><td><code>@s</code></td><td>実行者自身</td><td><strong>S</strong>elf</td></tr>
                                                                                                                                                                        </table>
                                                                                                                                                                    </div>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>2. 引数による絞り込み (Arguments)</h3>
                                                                                                                                                                        <p><code>@e</code> だけでは世界中の全てのモブを対象にしてしまいマイクラが壊れます。必ず <code>[]</code> で制限します。</p>
                                                                                                                                                                        <div class="code-block-demo">
                                                                                                                                                                            <span class="cmd">@e[type=zombie, distance=..10]</span>
                                                                                                                                                                        </div>
                                                                                                                                                                        <ul>
                                                                                                                                                                            <li><code>type=...</code> : エンティティの種類 (zombie, skeleton, itemなど)</li>
                                                                                                                                                                            <li><code>distance=..10</code> : 半径10マス以内 (..は「以下」の意味)</li>
                                                                                                                                                                            <li><code>limit=1</code> : 対象を1体だけに制限 (sortと一緒に使うことが多い)</li>
                                                                                                                                                                        </ul>
                                                                                                                                                                    </div>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>3. 相対座標 (Relative Coordinates)</h3>
                                                                                                                                                                        <p><code>~</code> (チルダ) は「現在の位置」を表します。</p>
                                                                                                                                                                        <ul class="no-dot">
                                                                                                                                                                            <li><code>~ ~1 ~</code> : 真上 (足元 + 1)</li>
                                                                                                                                                                            <li><code>~ ~-1 ~</code> : 真下 (足元のブロック)</li>
                                                                                                                                                                            <li><code>^ ^ ^5</code> : 視線の先に5マス (ローカル座標)</li>
                                                                                                                                                                        </ul>
                                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="lesson-footer">
                                                                                                                                                                    <button class="primary-btn" onclick="app.startExam(2)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                </div>
                                                                                                                                                                `,
            3: `
                                                                                                                                                                <div class="level-header">
                                                                                                                                                                    <h2>Level 3: Logic User - 変数（スコアボード）</h2>
                                                                                                                                                                    <span class="level-badge">論理</span>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="goal-section">
                                                                                                                                                                    <h3>🎯 目標: 通貨システム (Economy)</h3>
                                                                                                                                                                    <p>【RPG開発 Phase 2: システム】<br>人が集まる場所には「経済」が必要です。プレイヤーの所持金(Gold)を管理し、画面に表示させましょう。</p>
                                                                                                                                                                </div>
                                                                                                                                                                <div class="level-body">
                                                                                                                                                                    <p class="intro-text">Minecraftでプログラミングをするための「メモリ」がスコアボードです。RPGの所持金、キル数、タイマー、フラグなどは全てこれで管理します。</p>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>1. オブジェクトの作成 (宣言)</h3>
                                                                                                                                                                        <p>変数は使う前に「宣言」が必要です。</p>
                                                                                                                                                                        <div class="code-block-demo">
                                                                                                                                                                            <span class="cmd">/scoreboard objectives add <span class="var">money</span> <span class="type">dummy</span> "所持金"</span>
                                                                                                                                                                        </div>
                                                                                                                                                                        <ul>
                                                                                                                                                                            <li><span class="var">money</span>: 変数ID (プログラムで使う名前)</li>
                                                                                                                                                                            <li><span class="type">dummy</span>: タイプの指定。dummyはコマンドでしか増減しない汎用タイプ。他にも <code>deathCount</code> (死んだら増える) などがある。</li>
                                                                                                                                                                            <li>"所持金": 表示名 (画面に出す時の名前)</li>
                                                                                                                                                                        </ul>
                                                                                                                                                                    </div>

                                                                                                                                                                    <div class="lesson-section">
                                                                                                                                                                        <h3>2. 計算処理 (Operation)</h3>
                                                                                                                                                                        <div class="code-block-demo">
                                                                                                                                                                            <span class="comment">// 代入 (=)</span><br>
                                                                                                                                                                                <span class="cmd">/scoreboard players set @s money 100</span><br><br>
                                                                                                                                                                                    <span class="comment">// 加算 (+)</span><br>
                                                                                                                                                                                        <span class="cmd">/scoreboard players add @s money 10</span><br><br>
                                                                                                                                                                                            <span class="comment">// 減算 (-)</span><br>
                                                                                                                                                                                                <span class="cmd">/scoreboard players remove @s money 50</span>
                                                                                                                                                                                            </div>
                                                                                                                                                                                        </div>

                                                                                                                                                                                            <div class="pro-tip">
                                                                                                                                                                                                <strong>💡 Pro Tip:</strong><br>
                                                                                                                                                                                                    <code>/scoreboard objectives setdisplay sidebar money</code> と打つと、画面右側に常にスコアを表示できます。デバッグに必須です。
                                                                                                                                                                                            </div>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="lesson-footer">
                                                                                                                                                                                            <button class="primary-btn" onclick="app.startExam(3)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        `,
            4: `
                                                                                                                                                                                        <div class="level-header">
                                                                                                                                                                                            <h2>Level 4: Engineer - コマンドブロック連携</h2>
                                                                                                                                                                                            <span class="level-badge">工学</span>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="goal-section">
                                                                                                                                                                                            <h3>🎯 目標: 装備ショップ (Auto Shop)</h3>
                                                                                                                                                                                            <p>【RPG開発 Phase 2: システム】<br>お金があるなら使う場所が必要です。ボタン一つで冒険の準備が整う「装備購入システム」を作ります。</p>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="level-body">
                                                                                                                                                                                            <p class="intro-text">1つのコマンドでは限界があります。ブロックを連結させて「システム」を構築しましょう。</p>

                                                                                                                                                                                            <div class="lesson-section">
                                                                                                                                                                                                <h3>3つのブロックタイプ</h3>
                                                                                                                                                                                                <div class="block-types-grid">
                                                                                                                                                                                                    <div class="bt-card imp">
                                                                                                                                                                                                        <h4>Impulse (衝撃)</h4>
                                                                                                                                                                                                        <p>条件: 動力が入った時</p>
                                                                                                                                                                                                        <p>動作: 1回だけ実行</p>
                                                                                                                                                                                                        <small>用途: 準備、リセット</small>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                    <div class="bt-card rep">
                                                                                                                                                                                                        <h4>Repeat (反復)</h4>
                                                                                                                                                                                                        <p>条件: 動力がある間</p>
                                                                                                                                                                                                        <p>動作: 毎ティック (20回/秒) 実行</p>
                                                                                                                                                                                                        <small>用途: 監視、常時実行</small>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                    <div class="bt-card chn">
                                                                                                                                                                                                        <h4>Chain (チェーン)</h4>
                                                                                                                                                                                                        <p>条件: 指している先にある時</p>
                                                                                                                                                                                                        <p>動作: 連鎖して実行</p>
                                                                                                                                                                                                        <small>用途: 処理の連結</small>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                </div>
                                                                                                                                                                                            </div>

                                                                                                                                                                                            <div class="lesson-section">
                                                                                                                                                                                                <h3>正しい接続ルール</h3>
                                                                                                                                                                                                <p>初心者が必ず躓くポイントです。</p>
                                                                                                                                                                                                <ol>
                                                                                                                                                                                                    <li><strong>向きが命:</strong> ブロックの「矢印」のような模様が、次のブロックに向かっている必要があります。</li>
                                                                                                                                                                                                    <li><strong>Chainの設定:</strong> Chainブロックは基本的に「<span style="color:#a5d6ff">常時実行 (Always Active)</span>」に設定します。「動力が必要」のままだと動きません。</li>
                                                                                                                                                                                                    <li><strong>Conditional (条件付き):</strong> 「前のコマンドが成功した時だけ実行する」という設定が可能です。if文のように使えます。</li>
                                                                                                                                                                                                </ol>
                                                                                                                                                                                            </div>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="lesson-footer">
                                                                                                                                                                                            <button class="primary-btn" onclick="app.startExam(4)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        `,
            5: `
                                                                                                                                                                                        <div class="level-header">
                                                                                                                                                                                            <h2>Level 5: Wizard - Execute</h2>
                                                                                                                                                                                            <span class="level-badge">魔術</span>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="goal-section">
                                                                                                                                                                                            <h3>🎯 目標: 魔法の杖 (Skill System)</h3>
                                                                                                                                                                                            <p>【RPG開発 Phase 2: システム】<br>ただ剣を振るだけでは足りません。特定のアイテムを持った時だけ発動する「必殺技」や「魔法」を実装します。</p>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="level-body">
                                                                                                                                                                                            <p class="intro-text"><strong><code>/execute</code></strong> は、現代マイクラコマンドの核となる最強のコマンドです。これを使えないと高度なことは何もできません。</p>
                                                                                                                                                                                            <p>このコマンドは、コマンドの「実行環境（誰が、どこで、どんな条件で）」を書き換えてから、実際のコマンド(run)を実行します。</p>

                                                                                                                                                                                            <div class="lesson-section">
                                                                                                                                                                                                <h3>主要なサブコマンド</h3>
                                                                                                                                                                                                <ul class="concept-list">
                                                                                                                                                                                                    <li><span class="keyword">as</span> <span class="arg">@target</span>: <strong>実行者を書き換える</strong>（"私"を変える）</li>
                                                                                                                                                                                                    <li><span class="keyword">at</span> <span class="arg">@target</span>: <strong>実行場所を書き換える</strong>（その人の場所で）</li>
                                                                                                                                                                                                    <li><span class="keyword">if</span> <span class="arg">entity/block/score</span>: <strong>条件判定</strong>（もし〜なら実行）</li>
                                                                                                                                                                                                    <li><span class="keyword">unless</span>: <strong>否定条件</strong>（もし〜でなければ実行）</li>
                                                                                                                                                                                                    <li><span class="keyword">store</span>: <strong>結果の保存</strong>（実行結果を変数に入れる）</li>
                                                                                                                                                                                                </ul>
                                                                                                                                                                                            </div>

                                                                                                                                                                                            <div class="lesson-section">
                                                                                                                                                                                                <h3>実践: 魔法の構文読解</h3>
                                                                                                                                                                                                <div class="code-block-demo">
                                                                                                                                                                                                    execute <span class="sub">as</span> @a <span class="sub">at</span> @s <span class="sub">if</span> block ~ ~-1 ~ gold_block <span class="keyword">run</span> effect give @s speed
                                                                                                                                                                                                </div>
                                                                                                                                                                                                <p><strong>日本語訳:</strong><br>
                                                                                                                                                                                                    「全員として(as)、その場所で(at)、もし足元が金ブロックなら(if)、自分にスピードアップを与える(run)」</p>
                                                                                                                                                                                                <p>この <code>as @a at @s</code> は「全員がそれぞれの場所で」という意味のイディオムです。暗記しましょう。</p>
                                                                                                                                                                                            </div>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="lesson-footer">
                                                                                                                                                                                            <button class="primary-btn" onclick="app.startExam(5)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        `,
            6: `
                                                                                                                                                                                        <div class="level-header">
                                                                                                                                                                                            <h2>Level 6: Architect - Datapacks</h2>
                                                                                                                                                                                            <span class="level-badge">建築家</span>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="goal-section">
                                                                                                                                                                                            <h3>🎯 目標: 配布パッケージ (Release Build)</h3>
                                                                                                                                                                                            <p>【RPG開発 Phase 3: リリース】<br>完成したシステムを「データパック」としてまとめ、全世界に配布・導入できる形にパッケージングします。</p>
                                                                                                                                                                                        </div>
                                                                                                                                                                                        <div class="level-body">
                                                                                                                                                                                            <p class="intro-text">コマンドブロックを並べる時代は終わりました。真の「開発者」は、VS Codeなどのエディタでテキストファイルを書きます。</p>

                                                                                                                                                                                            <div class="lesson-section">
                                                                                                                                                                                                <h3>データパック (Datapack) とは</h3>
                                                                                                                                                                                                <p>ワールドデータの中に保存する、機能追加パックです。MODと違い、バニラの機能だけで動きます。</p>
                                                                                                                                                                                                <div class="file-structure">
                                                                                                                                                                                                    📂 MyDatapack/<br>
                                                                                                                                                                                                        📄 pack.mcmeta (定義ファイル)<br>
                                                                                                                                                                                                            📂 data/<br>
                                                                                                                                                                                                                📂 my_namespace/<br>
                                                                                                                                                                                                                    📂 functions/<br>
                                                                                                                                                                                                                        📄 main.mcfunction (コマンドが書かれたファイル)
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                                                                    <h3>mcfunctionの利点</h3>
                                                                                                                                                                                                                    <ol>
                                                                                                                                                                                                                        <li><strong>パフォーマンス:</strong> コマンドブロックのような描画負荷がゼロ。</li>
                                                                                                                                                                                                                        <li><strong>再帰処理:</strong> 自分自身を呼び出すことでループ処理が可能。</li>
                                                                                                                                                                                                                        <li><strong>バージョン管理:</strong> GitHubなどでコードを管理できる。</li>
                                                                                                                                                                                                                        <li><strong>コメント:</strong> <code>#</code> でコメントを書けるため、複雑なロジックを説明できる。</li>
                                                                                                                                                                                                                    </ol>
                                                                                                                                                                                                                    <p>学習用のツールとしてはコマンドブロックが優秀ですが、配布マップを作るならデータパック一択です。</p>
                                                                                                                                                                                                                </div>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="lesson-footer">
                                                                                                                                                                                                                <button class="primary-btn" onclick="app.startExam(6)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            `,
            7: `
                                                                                                                                                                                                            <div class="level-header">
                                                                                                                                                                                                                <h2>Level 7: Grandmaster - Macros</h2>
                                                                                                                                                                                                                <span class="level-badge">創造主</span>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="goal-section">
                                                                                                                                                                                                                <h3>🎯 目標: アイテムID管理 (Resource Mgmt)</h3>
                                                                                                                                                                                                                <p>【RPG開発 Phase 3: リリース】<br>数百種類に増えたRPGアイテムやモブを、たった1つのマクロで効率的に管理する「開発者ツール」を作ります。</p>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="level-body">
                                                                                                                                                                                                                <p class="intro-text">Minecraft 1.20.2 で追加された革命、「マクロ」。コマンドの一部を「文字列置換」で動的に書き換える機能です。</p>

                                                                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                                                                    <h3>変数の埋め込み</h3>
                                                                                                                                                                                                                    <p><code>$</code> を付けたマクロコマンド内では、<code>$(変数名)</code> の部分が実行時に置き換わります。</p>
                                                                                                                                                                                                                    <div class="code-block-demo">
                                                                                                                                                                                                                        <span class="comment"># data storage example: {target_name: "Steve"}</span><br>
                                                                                                                                                                                                                            $say こんにちは、$(target_name) さん！
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                    <p>実行時には <code>say こんにちは、Steve さん！</code> として処理されます。</p>
                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                                                                    <h3>何がすごいの？</h3>
                                                                                                                                                                                                                    <p>これまで「アイテムIDごとに何百ものコマンドを書く」必要があった処理が、たった1行で済むようになります。</p>
                                                                                                                                                                                                                    <ul>
                                                                                                                                                                                                                        <li>プレイヤーが持っているアイテムのIDを読み取って、それに応じた処理をする。</li>
                                                                                                                                                                                                                        <li>動的な座標へテレポートする。</li>
                                                                                                                                                                                                                        <li>計算結果を直接コマンドの引数（威力など）に入れる。</li>
                                                                                                                                                                                                                    </ul>
                                                                                                                                                                                                                    <p>これが現代マイクラコマンドの最前線です。</p>
                                                                                                                                                                                                                </div>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="lesson-footer">
                                                                                                                                                                                                                <button class="primary-btn" onclick="app.startExam(7)">試験を受ける (Certification Exam)</button>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            `,
            8: `
                                                                                                                                                                                                            <div class="level-header">
                                                                                                                                                                                                                <h2>Level 8: Game Master - Server Admin</h2>
                                                                                                                                                                                                                <span class="level-badge">管理者</span>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="goal-section">
                                                                                                                                                                                                                <h3>🎯 目標: サーバーセキュリティ (Security)</h3>
                                                                                                                                                                                                                <p>【RPG開発 Phase 3: リリース】<br>いよいよサーバー公開です。荒らしや不正プレイヤーから世界を守る「管理者権限」と「セキュリティ」を学びます。</p>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                            <div class="level-body">
                                                                                                                                                                                                                <p class="intro-text">あなたは技術を極めました。これからは、人々が遊ぶたの世界を「管理」する立場です。</p>

                                                                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                                                                    <h3>サーバー管理コマンド (Admin Tools)</h3>
                                                                                                                                                                                                                    <table class="data-table">
                                                                                                                                                                                                                        <tr><th>コマンド</th><th>機能</th><th>注意点</th></tr>
                                                                                                                                                                                                                        <tr><td><code>/whitelist</code></td><td>アクセス制限</td><td>onにするとリスト外の人は入れなくなる</td></tr>
                                                                                                                                                                                                                        <tr><td><code>/kick</code></td><td>一時切断</td><td>警告として使われる</td></tr>
                                                                                                                                                                                                                        <tr><td><code>/ban</code></td><td>永久追放</td><td>IP Banも可能。最終手段。</td></tr>
                                                                                                                                                                                                                        <tr><td><code>/op</code></td><td>管理者権限付与</td><td><strong>絶対に見知らぬ人に与えてはいけない。</strong>コマンド使用権限も渡してしまう。</td></tr>
                                                                                                                                                                                                                    </table>
                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                <div class="lesson-section">
                                                                                                                                                                                                                    <h3>ゲームルールの整備</h3>
                                                                                                                                                                                                                    <p>快適なプレイ環境のために、以下のルール設定は必須レベルです。</p>
                                                                                                                                                                                                                    <ul class="no-dot">
                                                                                                                                                                                                                        <li><code>/gamerule commandBlockOutput false</code><br><span style="color:#888">ログ汚染を防ぐ</span></li>
                                                                                                                                                                                                                        <li><code>/gamerule doDaylightCycle false</code><br><span style="color:#888">時間を固定する</span></li>
                                                                                                                                                                                                                        <li><code>/gamerule keepInventory true</code><br><span style="color:#888">死んでもアイテムをロストしない (RPG向け)</span></li>
                                                                                                                                                                                                                    </ul>
                                                                                                                                                                                                                    <div class="pro-tip">
                                                                                                                                                                                                                        <strong>🏆 The End:</strong><br>
                                                                                                                                                                                                                            これですべてのカリキュラムは終了です。しかし、コマンドの可能性は無限大です。<br>
                                                                                                                                                                                                                                今度はあなたが、驚くような作品を作る番です。Good luck!
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                <div class="lesson-footer">
                                                                                                                                                                                                                    <button class="primary-btn" onclick="app.startExam(8)">最終試験を受ける (Final Exam)</button>
                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                `
        };
        return contents[levelId] || 'Content not found';
    },

    // --- Workshop V7: Detailed Steps + Challenges ---
    workshopData: {
        'part_wand': {
            title: '魔法の杖 (Lightning Wand)',
            icon: '⚡',
            desc: '「人参付きの棒」を振ると雷が落ちる！魔法使いへの第一歩。',
            levelReq: 1,
            reqNode: 'basic_4',
            category: 'part',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '右クリック検知の仕組みを理解する。',
                    desc: '「人参付きの棒」を右クリックした一瞬を検知し、その瞬間にコマンドを実行するのが基本です。',
                    keyPoints: ['右クリック = minecraft.used:carrot_on_a_stick', 'スコアが1増えたら「クリックした」とみなす']
                },
                {
                    title: '1. 検知用スコア (Detection)',
                    goal: 'クリック回数を数えるスコアボードを作成する。',
                    desc: 'まずはシステムの下準備です。このコマンドはチャット欄で一度だけ実行すればOKです。',
                    code: '/scoreboard objectives add click minecraft.used:minecraft.carrot_on_a_stick',
                    keyPoints: ['objectives add: 新しいスコアを作る', 'minecraft.used:使用回数を自動で検知'],
                    breakdown: ['click: スコアの名前(自由につけてOK)']
                },
                {
                    title: '2. 魔法発動 (Cast)',
                    goal: '視線の先に雷を落とす。',
                    desc: '「スコアが1の人(クリックした人)」を対象にexecuteコマンドを実行します。',
                    code: '/execute as @a[scores={click=1..}] at @s positioned ^ ^ ^5 run summon lightning_bolt',
                    breakdown: [
                        'as @a[scores={click=1..}] : クリックした人を実行者にする',
                        'at @s : その人の場所で',
                        'positioned ^ ^ ^5 : 視線の5マス先を基準にする',
                        'run summon lightning_bolt : 雷を召喚する'
                    ]
                },
                {
                    title: '3. リセット (Reset)',
                    goal: '次の魔法のためにスコアを0に戻す。',
                    desc: 'これを忘れると、永遠に雷が落ち続けてしまいます！必ずセットで動かしましょう(チェーンコマブロなど)。',
                    code: '/scoreboard players set @a click 0',
                    keyPoints: ['players set: 数値を強制的に変更する']
                }
            ],
            challenge: {
                title: 'Mana System',
                desc: '「魔法を使うたびにレベル(XP)を1消費する」ように改造してみよう。XPがない時は発動しないようにするには？',
                hint: 'Hint: execute if entity @s[level=1..] ... / xp -1L @s'
            }
        },
        'part_fire_sword': {
            title: '炎の剣 (Fire Sword)',
            icon: '🔥',
            desc: '振ると炎が吹き出し、敵を焼き尽くす伝説の剣。',
            levelReq: 2,
            reqNode: 'entity_3',
            category: 'part',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '「特定のアイテムを持っている時だけ」発動する仕組みを作る。',
                    desc: '全ての剣が燃えるのではなく、「Ignis」という特別な名前の剣だけが能力を持つようにします。'
                },
                {
                    title: '1. アイテム入手 (Get Item)',
                    goal: 'NBTタグのついた特別な剣を入手する。',
                    desc: 'displayタグを使って名前(Name)と説明文(Lore)を設定します。',
                    code: '/give @p diamond_sword{display:{Name:\'"Ignis"\',Lore:[\'"Burn them all"\']}} 1',
                    breakdown: [
                        'Name:\'"..."\' : アイテム名。JSON形式で指定',
                        'Lore:[\'...\'] : アイテムの説明文（配列）'
                    ]
                },
                {
                    title: '2. エフェクト (Effect)',
                    goal: '剣を持っている間、炎のパーティクルを出す。',
                    desc: 'nbt={SelectedItem:...}を使うことで、手に持っているアイテムを詳細に判定できます。',
                    code: '/execute at @a[nbt={SelectedItem:{id:"minecraft:diamond_sword",tag:{display:{Name:\'"Ignis"\'}}}}] run particle flame ^ ^ ^1 0.2 0.2 0.2 0.05 5',
                    breakdown: [
                        'nbt={SelectedItem:{...}} : 手持ちアイテムのNBT一致判定',
                        'particle flame : 炎の粒子を表示'
                    ]
                },
                {
                    title: '3. 攻撃効果 (Damage)',
                    goal: '近くの敵を燃やしてダメージを与える。',
                    desc: '自分以外の(@s以外)、近くのエンティティに「即時ダメージ」を与えます。',
                    code: '/execute at @a[nbt={SelectedItem:{...}}] run effect give @e[distance=..3,type=!player] instant_damage 1',
                    keyPoints: ['distance=..3 : 半径3マス以内', 'type=!player : プレイヤー以外(味方は燃やさない)']
                }
            ],
            challenge: {
                title: 'Ice Sword',
                desc: '「氷の剣 (Blizzard)」を作り、持っている間は周りの水を凍らせる(water -> ice)ようにしてみよう。',
                hint: 'Hint: /fill ~-1 ~-1 ~-1 ~1 ~-1 ~1 ice replace water'
            }
        },
        'sys_economy': {
            title: '通貨システム (Economy)',
            icon: '💰',
            desc: 'RPGの基本。「G(ゴールド)」を作り、売買システムの基礎を学びます。',
            levelReq: 3,
            reqNode: 'logic_1_5',
            category: 'system',
            steps: [
                {
                    title: '1. オブジェクト作成 (Setup)',
                    goal: 'お金として使うスコアボードを作成する。',
                    desc: 'タイプは「dummy (ダミー)」を使います。これはコマンドでしか増減しない、自由な変数として扱えるタイプです。',
                    code: '/scoreboard objectives add gold dummy "Gold"',
                    keyPoints: ['dummy: コマンド操作専用のタイプ', '"Gold": 表示名(日本語も可)']
                },
                {
                    title: '2. 所持金表示 (Display)',
                    goal: '画面右側に所持金を表示する。',
                    desc: 'サイドバー(sidebar)に設定することで、常にプレイヤーが現在の所持金を確認できるようにします。',
                    code: '/scoreboard objectives setdisplay sidebar gold'
                },
                {
                    title: '3. ショップ購入 (Transaction)',
                    goal: '100Gでダイヤモンドを買うシステムを作る。',
                    desc: '「お金が足りているか確認」→「アイテムを渡す」→「お金を減らす」の順序が重要です。',
                    code: '/execute as @p[scores={gold=100..}] run give @s diamond 1\n/execute as @p[scores={gold=100..}] run scoreboard players remove @s gold 100',
                    breakdown: [
                        'scores={gold=100..} : 100以上持っている人だけ対象',
                        'remove @s gold 100 : 引き算を忘れると「無限錬金」されてしまいます！'
                    ]
                }
            ],
            challenge: {
                title: 'Coin Item',
                desc: '「エメラルドを拾ったら100G増える」システムを作ろう。拾ったエメラルドは消すこと。',
                hint: 'Hint: clearコマンドの戻り値を使うか、stat.pickupを使うか。'
            }
        },
        'boss_giant': {
            title: '巨人ゾンビ (The Giant)',
            icon: '🧟‍♂️',
            desc: '通常の3倍の大きさ、高いHPを持つ中ボスを作成します。',
            levelReq: 5,
            reqNode: 'entity_3',
            category: 'boss',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: 'ステータス(Attributes)を書き換えて最強のMobを作る。',
                    desc: '「装備」や「ポーション」だけでは限界があります。Attributesを使えば、サイズ・HP・攻撃力などを根本から改造できます。'
                },
                {
                    title: '1. 巨大化 (Scale)',
                    goal: 'ゾンビのサイズを3倍にする。',
                    desc: 'generic.scale という属性を変更します。(Minecraft 1.20.5以降)',
                    code: '/summon zombie ~ ~ ~ {attributes:[{id:"generic.scale",base:3.0}]}',
                    keyPoints: ['attributes:[...] : 属性リスト', 'base:3.0 : 基準値を3.0(3倍)にする']
                },
                {
                    title: '2. HP強化 (Max Health)',
                    goal: '最大HPを100に増やし、全快させる。',
                    desc: '最大値を増やすだけでなく、現在HP(Health)も設定しないと、召喚時は瀕死の状態になってしまいます。',
                    code: '/summon zombie ~ ~ ~ {attributes:[{id:"generic.scale",base:3.0},{id:"generic.max_health",base:100.0}],Health:100.0f}',
                    breakdown: ['generic.max_health : 最大体力の属性', 'Health:100.0f : 現在の体力(float型)']
                },
                {
                    title: '3. 装備 (Equipment)',
                    goal: 'フル装備させて威圧感を出す。',
                    desc: 'HandItems(手)とArmorItems(防具)を設定します。空欄の場所は {} と書きます。',
                    code: '/summon zombie ~ ~ ~ {..., HandItems:[{id:"iron_sword",Count:1b},{}], ArmorItems:[{id:"diamond_boots",Count:1b},{},{},{}]}'
                }
            ],
            challenge: {
                title: 'Boss Bar',
                desc: 'このボスのHPを画面上の「ボスバー」に表示し、リンクさせよう。',
                hint: 'Hint: /bossbar set ... players @e[tag=boss]'
            }
        },
        'game_tnt_run': {
            title: 'TNT Run',
            icon: '🧨',
            desc: '止まったら落ちる！踏んだブロックが消えるスリル満点のミニゲーム。',
            levelReq: 6,
            reqNode: 'world_2',
            category: 'game',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: 'プレイヤーの足元のブロックを検知し、空気(air)に置き換える。',
                    desc: 'シンプルですが、マルチプレイでやると非常に盛り上がる定番ゲームです。'
                },
                {
                    title: '1. ブロック破壊 (Destroy)',
                    goal: '自分の真下のブロック(-1)を消す。',
                    desc: 'とりあえず消すだけなら簡単です。destroyモードを指定すると、パーティクルが出て消える演出になります。',
                    code: '/execute at @a run setblock ~ ~-1 ~ air destroy'
                },
                {
                    title: '2. 遅延処理 (Delay)',
                    goal: '即死ではなく「崩れる」演出を作る。',
                    desc: 'いきなり消えるのではなく、一度「砂(sand)」に変えて落下させてから消すのが本家の再現です。',
                    code: '/execute at @a if block ~ ~-1 ~ stone run setblock ~ ~-1 ~ sand',
                    breakdown: ['石を踏んだら砂に変える → 砂は重力で落ちる → 結果的に床が抜ける']
                },
                {
                    title: '3. デス判定 (Game Over)',
                    goal: '落下したプレイヤーを脱落させる。',
                    desc: 'Y座標が0以下になったら負けです。スペクテイターモードに変更して観戦させます。',
                    code: '/execute as @a[y=0,dy=-10] run gamemode spectator @s',
                    keyPoints: ['y=0, dy=-10 : Y=0から下方向10マスの範囲']
                }
            ],
            challenge: {
                title: 'Multiplayer',
                desc: '「最後の一人になったら勝利」という判定を追加しよう。',
                hint: 'Hint: execute if entity @a[gamemode=survival,limit=1] ...'
            }
        },
        'game_tag': {
            title: '鬼ごっこ (Tag)',
            icon: '👹',
            desc: '光る鬼から逃げろ！タッチ判定と役割交代システム。',
            levelReq: 6,
            reqNode: 'logic_2',
            category: 'game',
            steps: [
                {
                    title: '1. チーム作成 (Teams)',
                    goal: '「鬼」と「逃走者」のチーム分けをする。',
                    desc: '色を付けることで視覚的に分かりやすくします。',
                    code: '/team add Oni {"color":"red"}\n/team add Runner {"color":"green"}',
                    keyPoints: ['team add : チーム作成', 'color : 名前や発光色の変更']
                },
                {
                    title: '2. 鬼の強調 (Glowing)',
                    goal: '鬼だけ壁越しでも見えるようにする。',
                    desc: '鬼チーム全員に「発光(Glowing)」エフェクトを無限に与え続けます。',
                    code: '/effect give @a[team=Oni] glowing 9999 1 true'
                },
                {
                    title: '3. タッチ判定 (Tagging)',
                    goal: '鬼が逃走者に触れたら役割を入れ替える。',
                    desc: '鬼の周囲1マス以内に逃走者がいたら(distance=..1)、専用の関数(function)やコマンド群を実行してチームを入れ替えます。',
                    code: '/execute as @a[team=Oni] at @s if entity @a[team=Runner,distance=..1] run function tag:swap'
                }
            ],
            challenge: {
                title: 'Timer',
                desc: '制限時間5分で終了し、その時鬼だったプレイヤーが負けになるシステムを作ろう。',
                hint: 'Hint: scoreboard players remove Timer Global 1'
            }
        },

        // --- EXTENDED (Requested) ---
        'part_grapple': {
            title: 'グラップリングフック (Grappling Hook)',
            icon: '🎣',
            desc: '釣竿の針に向かって飛んでいく、爽快な移動アクション。',
            levelReq: 4,
            reqNode: 'master_1',
            category: 'part',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '釣竿の「浮き(Bobber)」の場所まで飛んでいく仕組みを作る。',
                    desc: '釣竿を投げると fishing_bobber というエンティティが出現します。これを利用して移動先を決めます。'
                },
                {
                    title: '1. 針の検知 (Detection)',
                    goal: '自分が投げた針を見つける。',
                    desc: 'まずはexecuteで「自分の近くにある浮き」を探し、対象として認識できるかテストします。',
                    code: '/execute as @a at @s if entity @e[type=fishing_bobber,distance=..30] run say Hook Detected!',
                    keyPoints: ['type=fishing_bobber : 釣竿の針', 'distance=..30 : 遠すぎると無効にする制限']
                },
                {
                    title: '2. 引っ張る (Pull)',
                    goal: '針の方に向かってプレイヤーを移動させる。',
                    desc: '「自分が、針の方を向いて、少し前にTPする」を高速で繰り返すと、引っ張られているように見えます。',
                    code: '/execute as @s facing entity @e[type=fishing_bobber,limit=1] feet run tp @s ^ ^ ^0.5',
                    breakdown: [
                        'facing entity ... : 針の方向を向く',
                        'tp @s ^ ^ ^0.5 : 向いている方向に0.5マス進む'
                    ]
                },
                {
                    title: '3. 着地リセット (Landing)',
                    goal: '地面に着いたら針を消す。',
                    desc: '針が地面以外の何かにぶつかったら（ここでは簡易的に判定）、針を消して移動を終了させます。',
                    code: '/execute at @e[type=fishing_bobber] unless block ~ ~-0.1 ~ air run kill @s',
                    breakdown: [
                        'unless block ... air : 足元が空気じゃなかったら(=何かにぶつかったら)',
                        'kill @s : 針自身を消す'
                    ]
                }
            ],
            challenge: {
                title: 'Cooldown',
                desc: '連続で使えないように、使用後に3秒間のクールタイムを設けよう。',
                hint: 'Hint: scoreboard timer and xp bar display'
            }
        },
        'sys_crafting': {
            title: 'カスタムクラフト (Floor Crafting)',
            icon: '⚒️',
            desc: '地面にアイテムを投げると融合して新しいアイテムができる！',
            levelReq: 5,
            reqNode: 'master_1',
            category: 'system',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '2つのアイテムが重なった瞬間を検知する。',
                    desc: '「ダイヤモンド」と「棒」が同じ場所(距離1マス以内)にある時、化学反応を起こします。'
                },
                {
                    title: '1. 素材検知 (Recipe)',
                    goal: '地面に落ちているダイヤから見て、近くに棒があるか確認。',
                    desc: 'execute at を使って「ダイヤの場所」を基準にし、if entity で「近くの棒」を探します。',
                    code: '/execute at @e[type=item,nbt={Item:{id:"minecraft:diamond"}}] if entity @e[type=item,distance=..1,nbt={Item:{id:"minecraft:stick"}}] run say Recipe Valid!',
                    keyPoints: ['type=item : ドロップ状態のアイテム', 'nbt={Item:{id:"..."}} : アイテムの種類を指定']
                },
                {
                    title: '2. 完成品出現 (Result)',
                    goal: '素材の場所に新しいアイテムを召喚する。',
                    desc: '成功条件を満たした場所(ダイヤの場所)に、完成品(魔法の杖)を出現させます。タグで名前を付けましょう。',
                    code: '/summon item ~ ~ ~ {Item:{id:"minecraft:carrot_on_a_stick",Count:1b,tag:{display:{Name:\'"Magic Wand"\'}}}}',
                    breakdown: ['summon item : アイテムをスポーンさせる', 'Count:1b : 個数指定(必須)']
                },
                {
                    title: '3. 素材削除 (Cleanup)',
                    goal: '素材となったアイテムを消す。',
                    desc: 'これをやらないと、1セットの素材から無限に完成品が作れてしまいます。',
                    code: '/execute at @e[type=item,nbt={Item:{id:"minecraft:diamond"}}] if entity @e[type=item,distance=..1,nbt={Item:{id:"minecraft:stick"}}] run kill @e[type=item,distance=..1,nbt={Item:{id:"minecraft:diamond"}},limit=1]'
                }
            ],
            challenge: {
                title: 'Sound & Particle',
                desc: 'クラフト成功時に「きらーん」という音とパーティクルを出して演出を強化しよう。',
                hint: 'Hint: playsound block.anvil.use ... / particle happy_villager'
            }
        },
        'sys_turret': {
            title: '自動砲台 (Auto Turret)',
            icon: '🔫',
            desc: '敵を見つけると自動で矢を放つ防衛システム。',
            levelReq: 7,
            reqNode: 'master_5',
            category: 'system',
            steps: [
                {
                    title: '1. 本体作成 (Hull)',
                    goal: '砲台となる防具立てを設置する。',
                    desc: '「turret」というタグを付けて、普通の防具立てと区別します。カスタムネームも設定しましょう。',
                    code: '/summon armor_stand ~ ~ ~ {Tags:["turret"],CustomName:\'"MK-1"\'}'
                },
                {
                    title: '2. 索敵 (Tracking)',
                    goal: '一番近い敵の方を向く。',
                    desc: '「sort=nearest (近い順)」を使って、一番近いゾンビを特定し、その方向を向きます(facing)。',
                    code: '/execute as @e[tag=turret] at @s facing entity @e[type=zombie,limit=1,sort=nearest] feet run tp @s ~ ~ ~ ~ ~',
                    breakdown: [
                        'facing entity ... feet : 敵の足元を見る',
                        'tp @s ~ ~ ~ ~ ~ : その場回転'
                    ]
                },
                {
                    title: '3. 発射 (Fire)',
                    goal: '向いている方向に矢を発射する。',
                    desc: '矢を召喚し、Motion(運動ベクトル)を与えて飛ばします。計算が面倒ですが、^ ^ ^ (視線座標)を使うと手軽に「前」に出せます。',
                    code: '/execute at @e[tag=turret] run summon arrow ^ ^1.5 ^1 {Motion:[0.0, 1.0, 0.0]}',
                    keyPoints: ['正確に飛ばすには本当はベクトル計算が必要だが、簡易版として目の前に出す']
                }
            ],
            challenge: {
                title: 'Laser Beam',
                desc: '矢の代わりに「パーティクルの線」を出して、即座にダメージを与えるビーム兵器に改造しよう。',
                hint: 'Hint: particles in a straight line (recursion)'
            }
        },
        'game_death_swap': {
            title: 'Death Swap',
            icon: '🔄',
            desc: '30秒ごとに位置が入れ替わる！危険な場所に移動して相手を罠に嵌めよう。',
            levelReq: 6,
            reqNode: 'logic_2',
            category: 'game',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '2人のプレイヤーの位置を入れ替える。',
                    desc: 'Minecraftには「位置交換」コマンドはないので、「A→保存場所」「B→A」「保存場所→B」という3ステップで実装します。'
                },
                {
                    title: '1. 座標保存 (Save Pos)',
                    goal: 'Aの場所に目印(アーマースタンド)を置く。',
                    desc: 'Aが移動してしまう前に、今の場所を記録しておきます。',
                    code: '/execute at @p[tag=A] run summon armor_stand ~ ~ ~ {Tags:["temp_loc"]}'
                },
                {
                    title: '2. テレポート (Swap)',
                    goal: 'AをBへ、Bを目印へ飛ばす。',
                    desc: 'この2つは同時に(同じティック内で)行います。順序が重要です。',
                    code: '/tp @p[tag=A] @p[tag=B]\n/tp @p[tag=B] @e[tag=temp_loc,limit=1]'
                },
                {
                    title: '3. 後片付け (Cleanup)',
                    goal: '目印を消す。',
                    desc: '使い終わったアーマースタンドは必ず消しましょう。残すと重くなります。',
                    code: '/kill @e[tag=temp_loc]'
                }
            ],
            challenge: {
                title: 'Random Timer',
                desc: '入れ替わる時間を「2分～5分のランダム」にして、いつ起こるかわからないスリルを演出しよう。',
                hint: 'Hint: scoreboard random logic'
            }
        },

        // --- NEW ADDITIONS (Round 2) ---
        'part_dash': {
            title: 'ダッシュブーツ (Dash Boots)',
            icon: '👟',
            desc: 'スニークすると向いている方向にカッ飛ぶ、爽快移動スキル。',
            levelReq: 2,
            reqNode: 'logic_1',
            category: 'part',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '「スニーク(しゃがみ)」を検知してアクションを起こす。',
                    desc: '統計スコア(statistics)を使うと、ジャンプやスニーク、ダッシュなどの行動数をカウントできます。'
                },
                {
                    title: '1. スニーク検知 (Detection)',
                    goal: 'スニークした時間を計測するスコアボードを作る。',
                    desc: 'minecraft.custom:minecraft.sneak_time を使うと、スニークしている間ティック単位でスコアが増え続けます。',
                    code: '/scoreboard objectives add sneak minecraft.custom:minecraft.sneak_time',
                    keyPoints: ['objectives add ... sneak_time : スニーク時間の計測']
                },
                {
                    title: '2. ダッシュ処理 (Action)',
                    goal: 'スニークした瞬間、前方へテレポートする。',
                    desc: 'スコアが1以上になった瞬間を検知して実行します。画面演出(パーティクル)も忘れずに！',
                    code: '/execute as @a[scores={sneak=1..}] at @s run tp @s ^ ^ ^3\n/execute as @a[scores={sneak=1..}] at @s run particle cloud ~ ~1 ~ 0 0 0 0.1 10',
                    breakdown: [
                        'tp @s ^ ^ ^3 : 向いている方向に3マス進む',
                        'particle cloud : 煙エフェクトを足元に出す'
                    ]
                },
                {
                    title: '3. リセット (Reset)',
                    goal: 'スコアをリセットして連打を防ぐ。',
                    desc: '処理が終わったらすぐにスコアを0に戻します。',
                    code: '/scoreboard players set @a sneak 0'
                }
            ],
            challenge: {
                title: 'Stamina',
                desc: '連続で使うと疲れるように「スタミナゲージ」を追加しよう。',
                hint: 'Hint: experience bar as energy'
            }
        },
        'sys_elevator': {
            title: 'エレベーター (Elevator)',
            icon: '🛗',
            desc: 'ジャンプで上昇、スニークで下降。テレポートを使った階層移動システム。',
            levelReq: 3,
            reqNode: 'world_1',
            category: 'system',
            steps: [
                {
                    title: '原理 (Logic)',
                    goal: '床の種類と行動(ジャンプ/スニーク)を組み合わせて判定する。',
                    desc: '「鉄ブロックの上にいる」かつ「ジャンプした」時だけ作動するように条件を絞ります。'
                },
                {
                    title: '1. 上昇 (Up)',
                    goal: '鉄ブロックの上でジャンプしたら、上の階(Y+5)へ移動。',
                    desc: '足元のブロック(block ~ ~-1 ~)を確認し、条件が合えばTPさせます。',
                    code: '/execute as @a[scores={jump=1..}] at @s if block ~ ~-1 ~ iron_block run tp @s ~ ~5 ~',
                    keyPoints: ['stat.jump : ジャンプ回数計測スコア', '~ ~5 ~ : 現在地から5マス上へ相対移動']
                },
                {
                    title: '2. 下降 (Down)',
                    goal: '鉄ブロックの上でスニークしたら、下の階(Y-5)へ移動。',
                    desc: '同様にスニーク検知スコアを使って、下方向へテレポートさせます。',
                    code: '/execute as @a[scores={sneak=1..}] at @s if block ~ ~-1 ~ iron_block run tp @s ~ ~-5 ~',
                    keyPoints: ['stat.sneak_time : スニーク時間計測スコア']
                },
                {
                    title: '3. 安全確保 (Safety)',
                    goal: '壁の中に埋まらないようにする。',
                    desc: '移動先に空気(air)がある確認してからTPしないと、窒息してしまいます。',
                    code: '/execute ... if block ~ ~5 ~ air run tp ...',
                    breakdown: ['if block (移動先) air : 移動先が空気ブロックなら実行']
                }
            ],
            challenge: {
                title: 'Smooth TP',
                desc: '一瞬で飛ぶのでなく、浮遊エフェクト(Levitation)でふわっと上がるようにできるかな？',
                hint: 'Hint: effect give ... levitation 1 10'
            }
        },
        'world_meteor': {
            title: '流星群 (Meteor Shower)',
            icon: '🌠',
            desc: '空から燃えるブロックが降り注ぐ！災害シミュレーション。',
            levelReq: 5,
            reqNode: 'world_1_5',
            category: 'world',
            steps: [
                {
                    title: '1. スポーン地点 (Spawn Point)',
                    goal: 'プレイヤー周辺の空中のランダムな位置を選ぶ。',
                    desc: 'spreadplayers コマンドを使うと、指定した範囲内のランダムな地表にエンティティを散らばらせることができます。その後 tp で空中に上げます。',
                    code: '/execute at @p run spreadplayers ~ ~ 10 30 false @e[type=armor_stand,tag=meteor_spawn]'
                },
                {
                    title: '2. 落下物召喚 (Summon)',
                    goal: '火の玉(fireball)を召喚して落とす。',
                    desc: 'ExplosionPower(爆発力)を設定した火の玉を呼び出します。Power(加速)を下向きに設定すると勢いよく落ちます。',
                    code: '/summon fireball ~ ~50 ~ {Power:[0.0,-2.0,0.0],ExplosionPower:2}',
                    keyPoints: ['Power:[x,y,z] : 加速度指定']
                },
                {
                    title: '3. 演出 (Visuals)',
                    goal: '軌跡に煙を出して雰囲気を出す。',
                    desc: 'execute at @e[type=fireball] run particle... で、火の玉自身にパーティクルを出させます。'
                }
            ],
            challenge: {
                title: 'Warning',
                desc: '「落下地点」に魔法陣を表示して、プレイヤーに警告しよう。',
                hint: 'Hint: raycast down to ground'
            }
        },
        'game_zombie_escape': {
            title: 'ゾンビエスケープ (Zombie Escape)',
            icon: '🧟‍♀️',
            desc: '超高速ゾンビから逃げながらアスレチックを攻略せよ！',
            levelReq: 7,
            reqNode: 'logic_2',
            category: 'game',
            steps: [
                {
                    title: '1. 役職設定 (Roles)',
                    goal: '最初の一人(マザーゾンビ)を決める。',
                    desc: 'ランダムに一人選んでZombieチームに入れ、残りはHumanチームにします。',
                    code: '/team add Human\n/team add Zombie\n/team join Zombie @r'
                },
                {
                    title: '2. ゾンビ強化 (Buff)',
                    goal: 'ゾンビを最強かつ、最初は動けないようにする。',
                    desc: '「20秒間盲目(動けない)」「その後永続スピード上昇Lv5」という風に、Start delayを作ります。',
                    code: '/effect give @a[team=Zombie] speed 9999 5\n/effect give @a[team=Zombie] blindness 20 1',
                    keyPoints: ['blindness: 走れなくなり、視界も奪う最強の足止め']
                },
                {
                    title: '3. 感染 (Infection)',
                    goal: '捕まった人間（殴られた人間）をゾンビにする。',
                    desc: '対人戦なので execute ... if entity ... distance=..1 だと判定がシビアすぎます。hurt_by(ダメージを受けた)判定を使うのがスマートです。',
                    code: 'execute as @a[team=Zombie] at @s if entity @a[team=Human,distance=..1] run team join Zombie @e[...]'
                }
            ],
            challenge: {
                title: 'Hero Weapons',
                desc: '人間側に対抗手段として「ノックバック銃」を与えよう。',
                hint: 'Hint: enchant knockback / raycast push'
            }
        },
        'tool_vacuum': {
            title: '真空ホッパー (Vacuum Hopper)',
            icon: '🧹',
            desc: '落ちているアイテムが、掃除機のようにプレイヤーの足元に吸い寄せられます。',
            levelReq: 3,
            reqNode: 'basic_3', // Selector @e
            category: 'tool',
            steps: [
                {
                    title: '1. 対象感知 (Detection)',
                    goal: '吸い寄せる「対象」を正確に定義する。',
                    desc: 'まずは「誰を」吸い寄せるかを決めます。全てのエンティティ(@e)ではなく、アイテム(@e[type=item])だけを対象にしないと、牛やゾンビまで飛んできて大変なことになります！',
                    keyPoints: ['@e = 全エンティティ', 'type=item = ドロップアイテムのみ', 'distance=..10 = 半径10マス以内']
                },
                {
                    title: '2. 吸引処理 (Suction)',
                    goal: '対象をプレイヤーの目の前に移動させ続ける。',
                    desc: '検知したアイテムを、少しずつプレイヤーの方へ引き寄せます。テレポート(/tp)を連続で実行することで、吸い込まれているような動きを表現します。',
                    code: '/execute as @e[type=item,distance=..10] at @s run tp @s ^ ^ ^0.2 facing entity @p eyes',
                    breakdown: [
                        'as @e[...] : アイテム自身を実行者にする',
                        'at @s : アイテムの場所で実行する',
                        'facing entity @p eyes : プレイヤーの「目」の方向を向く',
                        'tp @s ^ ^ ^0.2 : 向いている方向(プレイヤー)へ0.2マス進む'
                    ]
                },
                {
                    title: '3. 仕上げ (Finishing)',
                    goal: '足元まで来たら拾う。',
                    desc: 'プレイヤーの足元までアイテムが来れば、あとはMinecraftの基本仕様で自動的に拾われます。特別なコマンドは不要ですが、吸引スピード(0.2)を調整して「吸い込み感」を変えてみるのも面白いでしょう。'
                }
            ],
            challenge: {
                title: 'Filter',
                desc: '「丸石」は吸い込まないようにフィルター設定を追加しよう。',
                hint: 'Hint: type=item,nbt={Item:{id:"minecraft:cobblestone"}}'
            }
        },
        'sys_timestop': {
            title: '時間停止 (Time Stop)',
            icon: '⏳',
            desc: '「ザ・ワールド！」世界の色が反転し、全てのモブの動きが止まります。',
            levelReq: 4,
            reqNode: 'world_1',
            category: 'system',
            steps: [
                {
                    title: '1. 世界固定 (World Freeze)',
                    goal: '時間の流れとモブの発生を止める。',
                    desc: 'まずはゲームルールの設定で、環境の変化を停止させます。',
                    code: '/gamerule doDaylightCycle false\n/gamerule doMobSpawning false',
                    keyPoints: ['doDaylightCycle false: 太陽の動きを止める']
                },
                {
                    title: '2. 思考停止 (Brain Freeze)',
                    goal: '全てのMobのAI(人工知能)をオフにする。',
                    desc: 'NoAIタグを1(true)にすると、Mobは動くことも考えることもできず、その場で固まります。物理法則(重力)は残ります。',
                    code: '/execute as @e[type=!player] run data merge entity @s {NoAI:1b}',
                    breakdown: [
                        'type=!player : プレイヤー以外全て',
                        'data merge : エンティティのNBTデータを書き換える',
                        '{NoAI:1b} : AIを無効化する'
                    ]
                },
                {
                    title: '3. 攻撃無効 (Invulnerability)',
                    goal: '重力もなくして完全静止させる(オプション)。',
                    desc: 'さらに {NoGravity:1b} も追加すると、空中で矢やMobが静止する完璧な時間停止になります。'
                }
            ],
            challenge: {
                title: 'Resume',
                desc: '解除した時に、AIを元に戻す(NoAI:0b)のを忘れずに。タグ管理でON/OFFを切り替えられるようにしよう。',
                hint: 'Hint: tag toggle'
            }
        },
        'sys_shop': {
            title: 'クリックショップ (Click Shop)',
            icon: '🏪',
            desc: '看板をクリックすると、所持金(Money)を消費してアイテムを買えます。',
            levelReq: 2,
            reqNode: 'logic_1',
            category: 'system',
            steps: [
                {
                    title: '1. 看板設置 (Sign)',
                    goal: 'クリックイベント付きの看板を生成する。',
                    desc: 'JSONテキストの clickEvent を使います。クリックすると /trigger buy_apple コマンドが実行されるように仕込みます。',
                    code: '/give @p oak_sign{BlockEntityTag:{Text2:\'{"text":"[Buy Apple]","clickEvent":{"action":"run_command","value":"/trigger buy_apple"}}\'}}',
                    breakdown: [
                        'BlockEntityTag : 看板の中身のデータ',
                        'clickEvent : クリック時の動作定義'
                    ]
                },
                {
                    title: '2. 検知 (Trigger)',
                    goal: 'プレイヤーが看板をクリックしたことを検知する。',
                    desc: 'triggerタイプのスコアは、一般プレイヤー(非OP)でもコマンドで数値を変更できる唯一の手段です。',
                    code: '/scoreboard objectives add buy_apple trigger',
                    keyPoints: ['triggerタイプ : 外部からの入力用']
                },
                {
                    title: '3. 取引実行 (Trade)',
                    goal: 'お金を確認してアイテムを渡す。',
                    desc: 'お金(money)が100以上あるか確認し、あれば100引いてリンゴを渡し、最後にトリガーを0に戻して待機状態にします。',
                    code: '/execute as @a[scores={buy_apple=1..}] if score @s money matches 100.. run give @s apple\n/scoreboard players set @a buy_apple 0'
                }
            ],
            challenge: {
                title: 'Sold Out',
                desc: '「在庫」を設定し、売り切れたら買えなくしよう。',
                hint: 'Hint: another scoreboard for stock'
            }
        },
        'wpn_homing': {
            title: '追尾アロー (Homing Arrow)',
            icon: '🏹',
            desc: '放った矢が生きているように敵を追いかけます。必中です。',
            levelReq: 7,
            reqNode: 'master_1',
            category: 'weapon',
            steps: [
                {
                    title: '1. タグ付け (Tagging)',
                    goal: '制御対象の矢を区別する。',
                    desc: '普通の矢と区別するために、新しく放たれた矢に「homing」タグを付けます。一度付けたら何度も付け直さないように tag=!homing で除外します。',
                    code: '/tag @e[type=arrow,tag=!homing] add homing',
                    keyPoints: ['tag add : エンティティに目印(タグ)を付ける']
                },
                {
                    title: '2. 索敵 (Aiming)',
                    goal: '矢を一番近い敵の方向へ向かせる。',
                    desc: 'これが追尾の核心です。毎ティック、矢の向き(rotation)を強制的に敌の方向に書き換えます。',
                    code: '/execute as @e[tag=homing] at @s facing entity @e[type=zombie,sort=nearest,limit=1] eyes run tp @s ~ ~ ~ ~ ~',
                    breakdown: [
                        'facing entity ... eyes : 敵の弱点(目)の方向を向く',
                        'tp @s ~ ~ ~ ~ ~ : 位置は変えず、向きだけ(facingの結果)を適用する'
                    ]
                },
                {
                    title: '3. 加速 (Thrust)',
                    goal: '向いている方向に飛ばす。',
                    desc: '向きを変えただけでは軌道は変わりません。さらに前方へテレポートさせることで、「曲がりながら飛ぶ」動きになります。',
                    code: '/execute as @e[tag=homing] at @s run tp @s ^ ^ ^0.5',
                    keyPoints: ['^ ^ ^0.5 : 視線方向に0.5マス進む']
                }
            ],
            challenge: {
                title: 'Sniper Mode',
                desc: 'プレイヤーがスニークしている時だけ追尾機能がオンになるように改造しよう。通常時は普通の矢として飛びます。',
                hint: 'Hint: execute if entity @p[scores={sneak=1..}]'
            }
        },

        // --- EXPANSION PACK V4 (Requested) ---
        'sys_weather': {
            title: '天候操作棒 (Weather Machine)',
            icon: '☔',
            desc: '棒を振ると雨が降り、もう一度振ると晴れる。',
            levelReq: 1,
            reqNode: 'basic_1',
            category: 'system',
            steps: [
                {
                    title: 'コンセプト (Concept)',
                    goal: '右クリック検知を使って天候を変える。',
                    desc: '基礎中の基礎ですが、意外と使います。'
                },
                {
                    title: '1. 検知 (Detect)',
                    goal: '棒の使用を検知する。',
                    desc: '人参付きの棒を使用します。',
                    code: '/scoreboard objectives add weather minecraft.used:minecraft.carrot_on_a_stick'
                },
                {
                    title: '2. 実行 (Action)',
                    goal: '天候を雷雨にする。',
                    desc: 'executeで自分を対象にして実行します。',
                    code: '/execute as @a[scores={weather=1..}] run weather thunder'
                },
                {
                    title: '3. リセット (Reset)',
                    goal: 'スコアを戻す。',
                    desc: 'これを忘れると毎ティック雷雨になります。',
                    code: '/scoreboard players set @a weather 0'
                }
            ],
            challenge: {
                title: 'Toggle',
                desc: '「晴れ→雨→晴れ」と交互に切り替わるようにできるかな？（タグかスコアで状態管理）',
                hint: 'Hint: tag addraining / execute if entity @s[tag=raining] ...'
            }
        },
        'part_double_jump': {
            title: 'ダブルジャンプ (Double Jump)',
            icon: '💨',
            desc: '空中でジャンプ！パルクールやアクションRPGに必須の機能。',
            levelReq: 2,
            reqNode: 'basic_4',
            category: 'part',
            steps: [
                {
                    title: 'コンセプト',
                    goal: '「空中にいるのにジャンプした」ことを検知する。',
                    desc: '足元が空気(air)なのに、statistic.jumpが増えた時、それは空中ジャンプです。'
                },
                {
                    title: '1. ジャンプ検知',
                    goal: 'ジャンプ回数を測る。',
                    desc: 'minecraft.custom:minecraft.jump を使います。',
                    code: '/scoreboard objectives add jump minecraft.custom:minecraft.jump'
                },
                {
                    title: '2. 空中判定',
                    goal: '足元が空気か確認して浮遊を与える。',
                    desc: 'ジャンプした瞬間、足元が空気なら「Levitation(浮遊)」を一瞬与えて上昇させます。',
                    code: '/execute as @a[scores={jump=1..}] at @s if block ~ ~-1 ~ air run effect give @s levitation 1 5 true'
                },
                {
                    title: '3. リセット',
                    goal: 'スコアを0に戻す。',
                    code: '/scoreboard players set @a jump 0'
                }
            ],
            challenge: {
                title: 'Double Only',
                desc: '「空中で1回だけ」しか使えないように制限しよう。地面に着くまで再使用不可にするには？',
                hint: 'Hint: tag add jumped / remove jumped if block ~ ~-1 ~ !air'
            }
        },
        'game_sumo': {
            title: 'Knockback Sumo',
            icon: '🥋',
            desc: '狭い足場で殴り合い！ノックバック10の棒で突き落とせ。',
            levelReq: 2,
            reqNode: 'basic_4',
            category: 'game',
            steps: [
                {
                    title: '1. 最強の棒',
                    goal: 'ノックバックLv10の棒を作る。',
                    desc: 'enchantmentタグを直接記述して、通常ではありえない強さの武器を作ります。',
                    code: '/give @p stick{Enchantments:[{id:"minecraft:knockback",lvl:10}]} 1'
                },
                {
                    title: '2. 耐性付与',
                    goal: '落下ダメージで死なないようにする。',
                    desc: '相撲なので、殴られて死ぬのではなく「落ちて死ぬ（またはTP）」のがルールです。ダメージを受けないよう耐性(resistance)をつけます。',
                    code: '/effect give @a resistance 9999 255 true'
                }
            ],
            challenge: {
                title: 'Auto Return',
                desc: '落ちた人（Y=0以下）を自動でステージ中央にTPし、負け数をカウントしよう。',
                hint: 'Hint: scoreboard deathCount'
            }
        },
        'sys_login': {
            title: 'ログインボーナス (Login Bonus)',
            icon: '🎁',
            desc: 'サーバーに入ると、1日1回アイテムがもらえる。',
            levelReq: 3,
            reqNode: 'logic_1',
            category: 'system',
            steps: [
                {
                    title: '1. 退出検知',
                    goal: '「ゲームを抜けた」時間を記録...は難しいので「ログイン」を検知する。',
                    desc: 'custom:leave_game という統計があります。これを使って「抜けてから戻ってきた」人を検知します。',
                    code: '/scoreboard objectives add left minecraft.custom:minecraft.leave_game'
                },
                {
                    title: '2. アイテム付与',
                    goal: '戻ってきた人にアイテムを渡す。',
                    desc: 'スコアが1以上の人にアイテムを配ります。',
                    code: '/execute as @a[scores={left=1..}] run give @s diamond 1'
                },
                {
                    title: '3. フラグ解消',
                    goal: '何度ももらえないようにする。',
                    desc: 'スコアを0に戻します。',
                    code: '/scoreboard players set @a left 0'
                }
            ],
            challenge: {
                title: 'Real Time',
                desc: '本物の「1日1回」にするには？（実はコマンドだけだと日付取得が難しいので、簡易的に24時間タイマーを作ろう）',
                hint: 'Hint: scoreboard timer add 1 (20 ticks = 1 sec)'
            }
        },
        'wpn_tnt_bow': {
            title: '爆裂弓 (Explosive Bow)',
            icon: '🏹',
            desc: '矢が着弾した瞬間にTNTを召喚する破壊兵器。',
            levelReq: 4,
            reqNode: 'entity_2',
            category: 'weapon',
            steps: [
                {
                    title: '1. 着弾検知',
                    goal: '「地面に刺さった矢」を検知する。',
                    desc: 'inGround:1b というNBTタグを持っていれば、それは着弾した矢です。',
                    code: '/execute as @e[type=arrow,nbt={inGround:1b}] at @s run ...'
                },
                {
                    title: '2. 爆発',
                    goal: 'その場所にTNTを呼び出す。',
                    desc: '着火済みのTNT(tnt)を召喚します。',
                    code: '/summon tnt ~ ~ ~ {Fuse:0}'
                },
                {
                    title: '3. 矢の消去',
                    goal: '使い終わった矢を消す。',
                    desc: '消さないと、毎ティックTNTが出続けて世界が崩壊します！！',
                    code: '/kill @s'
                }
            ],
            challenge: {
                title: 'Grenade',
                desc: '矢ではなく「雪玉」が当たった場所なら？（雪玉は着弾と同時に消滅するので、工夫が必要です）',
                hint: 'Hint: execute as snowball at @s unless block ~ ~-1 ~ air...'
            }
        },
        'part_jetpack': {
            title: 'ジェットパック (Jetpack)',
            icon: '🚀',
            desc: 'スニークしている間、空を飛び続ける。燃料はパーティクル。',
            levelReq: 4,
            reqNode: 'part_dash',
            category: 'part',
            steps: [
                {
                    title: '1. スニーク検知',
                    goal: 'スニーク時間を測る。',
                    code: '/scoreboard objectives add sneak minecraft.custom:minecraft.sneak_time'
                },
                {
                    title: '2. 上昇推力',
                    goal: 'スニーク中、常に上に浮遊を与える。',
                    desc: 'Levitationの効果時間を短く(1秒)、レベルを高くすると、ロケットのように飛べます。',
                    code: '/execute as @a[scores={sneak=1..}] run effect give @s levitation 1 5 true'
                },
                {
                    title: '3. 排気ガス',
                    goal: '足元に煙を出す。',
                    desc: '飛んでいる感を出します。',
                    code: '/execute at @a[scores={sneak=1..}] run particle campfier_signal_smoke ~ ~ ~ 0 0 0 0.1 5'
                }
            ],
            challenge: {
                title: 'Fuel',
                desc: 'ドロッパーなどに「石炭」が入っている時だけ飛べるようにしてみよう。',
                hint: 'Hint: clear @s coal 0 (check) -> clear 1 (consume)'
            }
        },
        'sys_kill_streak': {
            title: 'キルストリーク (Kill Streak)',
            icon: '⚔️',
            desc: '連続キルで強くなる！3キルで速度上昇、5キルで攻撃上昇。',
            levelReq: 5,
            reqNode: 'logic_1',
            category: 'system',
            steps: [
                {
                    title: '1. キル数計測',
                    goal: '敵を倒した数を数える。',
                    desc: 'playerKillCount または totalKillCount を使います。',
                    code: '/scoreboard objectives add kills totalKillCount'
                },
                {
                    title: '2. ボーナス付与',
                    goal: '3人倒したらスピードを上げる。',
                    desc: 'スコアが3の人にエフェクトを与えます。',
                    code: '/execute as @a[scores={kills=3}] run effect give @s speed 10 1'
                },
                {
                    title: '3. リセット条件',
                    goal: '死んだら0に戻る。',
                    desc: '死んだ回数(deathCount)を検知して、キル数をリセットします。',
                    code: '/execute as @a[scores={deaths=1..}] run scoreboard players set @s kills 0'
                }
            ],
            challenge: {
                title: 'Nuke',
                desc: '25キル達成したら、全員に「ウィザー」の効果を与えて勝利宣言を出そう。',
                hint: 'Hint: title @a title "TACTICAL NUKE"'
            }
        },
        'game_red_light': {
            title: 'だるまさんが転んだ (Red Light Green Light)',
            icon: '🚥',
            desc: '動いたら死ぬ。',
            levelReq: 6,
            reqNode: 'logic_2',
            category: 'game',
            steps: [
                {
                    title: 'コンセプト',
                    goal: '「動いているかどうか」をコマンドで正確に判定する難問。',
                    desc: '新機能の「座標の変化(delta)」を使うか、昔ながらの「座標比較」を使うか。ここでは座標比較で行きます。'
                },
                {
                    title: '1. 座標記録',
                    goal: '今の場所を保存する。',
                    desc: '全員の足元にAreaEffectCloud(目印)を召喚し、タグ付けします。',
                    code: '/execute at @a run summon area_effect_cloud ~ ~ ~ {Tags:["last_pos"],Duration:2}'
                },
                {
                    title: '2. 移動判定',
                    goal: '目印と離れていたら「動いた」とみなす。',
                    desc: '0.1秒後、自分の目印から距離が0.1以上離れていたらアウトです。',
                    code: '/execute as @a at @s unless entity @e[tag=last_pos,distance=..0.1] run kill @s'
                }
            ],
            challenge: {
                title: 'Stop/Go',
                desc: '「だるまさんが転んだ」と言ってる間だけ判定を行い、背を向けている間は動けるように管理しよう。',
                hint: 'Hint: Global state score 1=Red, 0=Green'
            }
        },
        'boss_slime': {
            title: 'King Slime',
            icon: '🟢',
            desc: '倒すと分裂する巨大スライムボス。',
            levelReq: 5,
            reqNode: 'boss_giant',
            category: 'boss',
            steps: [
                {
                    title: '1. 本体',
                    goal: 'サイズ10の巨大スライムを召喚。',
                    code: '/summon slime ~ ~ ~ {Size:10,Tags:["king_slime"],CustomName:\'"King Slime"\'}'
                },
                {
                    title: '2. 死亡検知',
                    goal: 'ボスが死んだ瞬間を検知する。',
                    desc: 'ボスの死亡回数、あるいは「ボスがいなくなった(unless entity)」で検知します。',
                    code: '/execute unless entity @e[tag=king_slime] run function boss:split'
                },
                {
                    title: '3. 分裂',
                    goal: '中サイズのスライムを4体召喚する。',
                    desc: 'ボスのいた場所に中スライムをばら撒きます。',
                    code: '/summon slime ~ ~ ~ {Size:5,Motion:[0.5,0.5,0.0]} ... (x4)'
                }
            ],
            challenge: {
                title: 'Regen',
                desc: '分裂したスライムが合体して復活するギミックは作れるかな？',
                hint: 'Hint: execute at slime if entity slime[distance=..1] ...'
            }
        },
        'sys_dungeon': {
            title: 'インスタントダンジョン (Instant Dungeon)',
            icon: '🏰',
            desc: 'ボタン一つで目の前にダンジョンが出現・消去される。',
            levelReq: 8,
            reqNode: 'world_2',
            category: 'world',
            steps: [
                {
                    title: 'コンセプト',
                    goal: 'ストラクチャーブロックの機能をコマンドで使う。',
                    desc: '事前に建築した部屋を「structure」として保存しておき、loadコマンドで呼び出します。'
                },
                {
                    title: '1. 構造物保存',
                    goal: '建築を保存する(GUIまたはコマンド)。',
                    desc: 'あらかじめストラクチャーブロックで "dungeon_room_1" という名前で保存しておきます。'
                },
                {
                    title: '2. 読み込み (Load)',
                    goal: '好きな場所に建物を出現させる。',
                    desc: '/place (1.19+) または /structure load を使います。',
                    code: '/place structure my_datapack:dungeon_room_1 ~ ~ ~'
                },
                {
                    title: '3. リセット',
                    goal: 'ダンジョンを消して更地にする。',
                    desc: '空気ブロック(air)でfillするか、"empty_room"という空のストラクチャーを読み込みます。',
                    code: '/fill ~ ~ ~ ~10 ~10 ~10 air'
                }
            ],
            challenge: {
                title: 'Random Gen',
                desc: '「部屋のパーツ」をランダムに組み合わせて、毎回違う迷路を作る...これは上級者への入り口です。',
                hint: 'Hint: Jigsaw block / structure pool'
            }
        }
    },

    renderWorkshopList() {
        const container = document.getElementById('workshop-container');
        if (!container) return;
        container.innerHTML = '';

        const currentLevel = this.state.currentLevel || 1;

        // Map Order Definition (Top to Bottom)
        const nodeOrder = [
            'basic_1', 'basic_2', 'basic_3', 'basic_4',
            'logic_1', 'logic_1_5', 'logic_2',
            'world_1', 'world_1_5', 'world_2',
            'entity_1', 'entity_2',
            'master_1', // Phase 3 Start
            'logic_3', 'world_3', 'entity_3',
            'master_2', // Phase 4 Start
            'master_3', 'master_4', 'master_5',
            'master_final'
        ];

        // Sort by Node Order, then Level
        const sortedEntries = Object.entries(this.workshopData).sort(([, a], [, b]) => {
            const indexA = nodeOrder.indexOf(a.reqNode);
            const indexB = nodeOrder.indexOf(b.reqNode);

            // If both have valid node mapping, sort by map order
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // Fallback: If one is missing mapping (e.g. ancient data), put it last
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return a.levelReq - b.levelReq;
        });

        sortedEntries.forEach(([key, data]) => {
            let isLocked = false;
            let lockReason = '';
            let requirementLabel = '';

            // Priority: Node Requirement > Level Requirement
            if (data.reqNode) {
                const nodeName = this.skillTree[data.reqNode] ? this.skillTree[data.reqNode].title : data.reqNode;

                if (!this.state.completedNodes.includes(data.reqNode)) {
                    isLocked = true;
                    lockReason = `🔒 習得必要: ${nodeName}`;
                    requirementLabel = lockReason;
                } else {
                    // Unlocked via Node
                    requirementLabel = `<span style="color:#8f8; font-size:0.9em;">✔ ${nodeName}</span>`;
                }
            } else {
                // Fallback: Level Requirement
                if (currentLevel < data.levelReq) {
                    isLocked = true;
                    lockReason = `🔒 レベル ${data.levelReq} 必要`;
                    requirementLabel = lockReason;
                } else {
                    requirementLabel = `レベル ${data.levelReq}+`;
                }
            }
            const isCompleted = this.state.completedWorkshops.includes(key);

            const card = document.createElement('div');
            card.className = `recipe-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

            if (!isLocked) {
                card.onclick = () => this.startWorkshop(key);
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
                card.title = lockReason;
            }

            const statusIcon = isCompleted ? '✅' : (isLocked ? '🔒' : '');

            card.innerHTML = `
                <div class="recipe-icon">${data.icon}</div>
                <h3>${data.title} ${statusIcon}</h3>
                <p>${data.desc}</p>
                <span class="difficulty" style="${isLocked ? 'color:#f55;' : ''}">
                    ${requirementLabel}
                </span>
            `;
            container.appendChild(card);
        });
    },

    workshopState: {
        activeId: null,
        activeStepIndex: 0
    },

    startWorkshop(recipeId) {
        const data = this.workshopData[recipeId];
        if (!data) return;

        this.workshopState.activeId = recipeId;
        this.workshopState.activeStepIndex = 0;

        const overlay = document.getElementById('workshop-overlay');
        overlay.classList.remove('hidden');

        // Hide legacy footer buttons as we use map navigation now
        const footer = overlay.querySelector('.overlay-footer');
        if (footer) footer.style.display = 'none';

        // Use full height for content
        const body = document.getElementById('ws-content');
        body.style.height = 'calc(100% - 60px)'; // Adjust for header

        this.renderWorkshopDetail(data);
    },

    renderWorkshopDetail(data) {
        document.getElementById('ws-title').innerText = data.title;
        document.getElementById('ws-progress').style.width = '0%'; // Hide or repurpose

        const container = document.getElementById('ws-content');
        container.innerHTML = `
            <div class="workshop-detail-container">
                <div class="workshop-sidebar">
                    <div class="step-map" id="workshop-step-map">
                        <!-- Steps injected here -->
                    </div>
                </div>
                <div class="workshop-main" id="workshop-step-content">
                    <!-- Content injected here -->
                </div>
            </div>
        `;

        this.renderWorkshopMap(data);
        this.selectWorkshopStep(0);
    },

    renderWorkshopMap(data) {
        const mapContainer = document.getElementById('workshop-step-map');
        if (!mapContainer) return;

        let html = '';
        data.steps.forEach((step, index) => {
            html += `
                <div class="step-node" id="step-node-${index}" onclick="app.selectWorkshopStep(${index})">
                    <div class="step-marker">${index + 1}</div>
                    <div class="step-line"></div>
                    <div class="step-label">Step ${index + 1}</div>
                </div>
            `;
        });

        // Challenge Node
        const chalIndex = data.steps.length; // Index after last step
        html += `
            <div class="step-node challenge" id="step-node-${chalIndex}" onclick="app.selectWorkshopStep(${chalIndex})">
                <div class="step-marker">★</div>
                <div class="step-label">Challenge</div>
            </div>
        `;

        mapContainer.innerHTML = html;
    },

    selectWorkshopStep(index) {
        this.workshopState.activeStepIndex = index;
        const data = this.workshopData[this.workshopState.activeId];

        // Update Map Active State
        const nodes = document.querySelectorAll('.step-node');
        nodes.forEach((n, i) => {
            if (i === index) n.classList.add('active');
            else n.classList.remove('active');
        });

        // Render Content
        const contentContainer = document.getElementById('workshop-step-content');

        // Check if Challenge
        if (index === data.steps.length) {
            const chal = data.challenge || { title: 'Completion', desc: 'Congratulations!', hint: '' };
            contentContainer.innerHTML = `
                <div class="challenge-content">
                    <div class="challenge-header">
                        <div class="challenge-badge">FINAL MISSION</div>
                        <h2 class="challenge-title">${chal.title}</h2>
                    </div>
                    
                    <div class="challenge-body">
                        <div class="challenge-goal-section">
                            <h3>🎯 Mission Objective</h3>
                            <p class="challenge-desc">${chal.desc}</p>
                        </div>

                        <div class="challenge-hint-section">
                            <h3>💡 Hint</h3>
                            <div class="hint-box">
                                ${chal.hint || 'No hint available.'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="complete-section">
                        <button class="workshop-finish-btn" onclick="app.completeWorkshop()">
                            Mission Complete!
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Normal Step
            const step = data.steps[index];

            // Goal Section
            let goalHtml = '';
            if (step.goal) {
                goalHtml = `
                    <div class="goal-box">
                        <strong>🎯 Goal</strong>
                        <p>${step.goal}</p>
                    </div>
                `;
            }

            // Key Points
            let pointsHtml = '';
            if (step.keyPoints && step.keyPoints.length > 0) {
                pointsHtml = '<ul class="key-points-list">';
                step.keyPoints.forEach(p => pointsHtml += `<li>${p}</li>`);
                pointsHtml += '</ul>';
            }

            // Code
            let codeHtml = '';
            let breakdownHtml = '';

            if (step.code) {
                const cleanerCode = step.code.trim();
                codeHtml = `
                    <div class="code-wrapper">
                        <div class="code-header">
                            <span class="code-label">COMMAND</span>
                            <button class="copy-btn-inline" onclick="app.copyCode(this, '${cleanerCode.replace(/'/g, "\\'")}')">
                                📋 Copy
                            </button>
                        </div>
                        <pre class="code-block"><code>${cleanerCode}</code></pre>
                    </div>
                `;

                if (step.breakdown && step.breakdown.length > 0) {
                    breakdownHtml = '<div class="breakdown-box"><strong>📝 Breakdown:</strong><ul>';
                    step.breakdown.forEach(b => breakdownHtml += `<li>${b}</li>`);
                    breakdownHtml += '</ul></div>';
                }
            }

            contentContainer.innerHTML = `
                <div class="step-header-sm">
                    <h2>Step ${index + 1}: ${step.title}</h2>
                </div>
                ${goalHtml}
                <p class="step-desc">${step.desc}</p>
                ${pointsHtml}
                ${codeHtml}
                ${breakdownHtml}
                <div class="hint-text">
                    ${index < data.steps.length - 1 ? 'Next: Select the next step.' : 'Next: Try the Challenge!'}
                </div>
            `;
        }
    },

    completeWorkshop() {
        const id = this.workshopState.activeId;
        if (!this.state.completedWorkshops.includes(id)) {
            this.state.completedWorkshops.push(id);
            this.saveState();
            this.renderWorkshopList(); // Refresh list to show checkmark
        }

        // Play sound or effect?
        alert('Workshop Completed! Good Job!');
        this.closeWorkshop();
    },

    prevStep() { /* Deprecated but kept for safety if called */ },
    nextStep() { /* Deprecated */ },

    closeWorkshop() {
        document.getElementById('workshop-overlay').classList.add('hidden');
        this.workshopState.activeId = null;
    },

    copyCode(btn, code) {
        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.innerText;
            btn.innerText = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    },

    // --- Toast System (V10.1) ---
    showToast(msg, icon = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return; // Fail safe

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
                                                                                                                                                                                                                    <span class="toast-icon">${icon}</span>
                                                                                                                                                                                                                    <span>${msg}</span>
                                                                                                                                                                                                                    `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- Tools (V4: Preview & Sign) ---
    // Updated V10.2: Localization & UX
    openTool(toolId) {
        const modal = document.getElementById('tool-modal');
        const content = document.getElementById('tool-content-area');
        modal.classList.remove('hidden');

        if (toolId === 'json') {
            content.innerHTML = `
                <h2>🎨 装飾テキスト作成 (JSON Text)</h2>
                <div class="preview-box"><span id="live-preview" class="preview-text">プレビュー</span></div>
                <div class="tool-form">
                    <label>表示テキスト</label>
                    <input type="text" id="json-text" placeholder="ここに文字を入力" class="glass-input" oninput="app.updatePreview()">
                    
                    <div class="tool-row">
                        <label>色: <input type="color" id="json-color" value="#ffffff" oninput="app.updatePreview()"></label>
                        <label><input type="checkbox" id="json-bold" onchange="app.updatePreview()"> 太字</label>
                        <label><input type="checkbox" id="json-italic" onchange="app.updatePreview()"> 斜体</label>
                    </div>
                    
                    <div class="tool-row" style="align-items:center;">
                         <label style="white-space:nowrap; margin-right:10px;">クリックアクション:</label>
                         <select id="json-click" class="glass-select">
                            <option value="none">なし</option>
                            <option value="run_command">コマンド実行</option>
                            <option value="suggest_command">入力補助</option>
                        </select>
                    </div>
                    <input type="text" id="json-click-val" placeholder="/say Hello" class="glass-input" style="margin-top:0;">
                    
                    <button class="neon-btn" onclick="app.generateJson()">コマンド生成</button>
                    <div id="json-result" class="result-box hidden"></div>
                </div>
            `;
        } else if (toolId === 'potion') {
            content.innerHTML = `
                <h2>🧪 ポーション作成 (Potion Generator)</h2>
                <div class="tool-form">
                    <label>エフェクト種類</label>
                    <select id="pot-effect" class="glass-select">
                        <option value="speed">移動速度上昇 (Speed)</option>
                        <option value="strength">攻撃力上昇 (Strength)</option>
                        <option value="regeneration">再生能力 (Regeneration)</option>
                        <option value="invisibility">透明化 (Invisibility)</option>
                        <option value="night_vision">暗視 (Night Vision)</option>
                        <option value="levitation">浮遊 (Levitation)</option>
                        <option value="jump_boost">跳躍力上昇 (Jump Boost)</option>
                        <option value="instant_health">即時回復 (Instant Health)</option>
                        <option value="instant_damage">即時ダメージ (Instant Damage)</option>
                    </select>
                    
                    <div class="tool-row">
                        <div>
                            <label>効果時間 (秒)</label>
                            <input type="number" id="pot-sec" placeholder="60" value="60" class="glass-input">
                        </div>
                        <div>
                            <label>強度 (Lv 0-255)</label>
                            <input type="number" id="pot-amp" placeholder="0" value="0" class="glass-input">
                        </div>
                    </div>
                    
                    <div class="tool-row">
                         <label><input type="checkbox" id="pot-hide"> パーティクルを隠す</label>
                    </div>
                    <button class="neon-btn" onclick="app.generatePotion()">コマンド生成</button>
                    <div id="pot-result" class="result-box hidden"></div>
                </div>
            `;
        } else if (toolId === 'sign') {
            content.innerHTML = `
                <h2>🪧 看板作成ツール (Sign Generator)</h2>
                <div class="tool-form">
                    <label>1行目</label>
                    <input type="text" id="sign-l1" placeholder="例: 右クリックしてね" class="glass-input">
                    <label>2行目</label>
                    <input type="text" id="sign-l2" placeholder="例: ダイヤゲット" class="glass-input">
                    
                    <label>実行コマンド</label>
                    <input type="text" id="sign-cmd" placeholder="/give @p diamond 1" class="glass-input">
                    
                    <button class="neon-btn" onclick="app.generateSign()">Giveコマンド生成</button>
                    <div id="sign-result" class="result-box hidden"></div>
                </div>
            `;
        } else if (toolId === 'color') {
            // Updated in previous step, checking if premium classes needed? 
            // The grid uses custom CSS anyway, so it's fine.
            content.innerHTML = `
                <h2>🌈 カラーコード一覧 (Color Codes)</h2>
                <p style="text-align:center; color:#888; margin-bottom:15px;">クリック・タップでコードをコピーできます。</p>
                <div class="color-grid">
                    <div class="color-item" onclick="app.copyText('§0')" style="color:#000; border-color:#555">§0 Black</div>
                    <div class="color-item" onclick="app.copyText('§1')" style="color:#0000AA">§1 D.Blue</div>
                    <div class="color-item" onclick="app.copyText('§2')" style="color:#00AA00">§2 Green</div>
                    <div class="color-item" onclick="app.copyText('§3')" style="color:#00AAAA">§3 Aqua</div>
                    <div class="color-item" onclick="app.copyText('§4')" style="color:#AA0000">§4 Red</div>
                    <div class="color-item" onclick="app.copyText('§5')" style="color:#AA00AA">§5 Purple</div>
                    <div class="color-item" onclick="app.copyText('§6')" style="color:#FFAA00">§6 Gold</div>
                    <div class="color-item" onclick="app.copyText('§7')" style="color:#AAAAAA">§7 Gray</div>
                    <div class="color-item" onclick="app.copyText('§8')" style="color:#555555">§8 D.Gray</div>
                    <div class="color-item" onclick="app.copyText('§9')" style="color:#5555FF">§9 Blue</div>
                    <div class="color-item" onclick="app.copyText('§a')" style="color:#55FF55">§a Lime</div>
                    <div class="color-item" onclick="app.copyText('§b')" style="color:#55FFFF">§b L.Aqua</div>
                    <div class="color-item" onclick="app.copyText('§c')" style="color:#FF5555">§c L.Red</div>
                    <div class="color-item" onclick="app.copyText('§d')" style="color:#FF55FF">§d Pink</div>
                    <div class="color-item" onclick="app.copyText('§e')" style="color:#FFFF55">§e Yellow</div>
                    <div class="color-item" onclick="app.copyText('§f')" style="color:#fff">§f White</div>
                </div>
            `;
        } else if (toolId === 'item') {
            content.innerHTML = `
                <h2>⚔️ アイテム生成 (Item Generator)</h2>
                <div class="tool-form">
                    <label>アイテムID</label>
                    <input type="text" id="item-id" placeholder="minecraft:diamond_sword" class="glass-input">
                    <label>表示名 (Display Name)</label>
                    <input type="text" id="item-name" placeholder="§6エクスカリバー" class="glass-input">
                    <label>説明 (Lore)</label>
                    <input type="text" id="item-lore" placeholder="§7伝説の剣" class="glass-input">
                    
                    <div class="tool-row split">
                        <input type="text" id="ench-id" placeholder="sharpness" class="glass-input">
                        <input type="number" id="ench-lvl" value="5" class="glass-input">
                    </div>
                    <label><input type="checkbox" id="item-unbreakable"> 不壊 (Unbreakable)</label>

                    <button class="neon-btn" onclick="app.generateItem()">Giveコマンド生成</button>
                    <div id="item-result" class="result-box hidden"></div>
                </div>
            `;
        } else if (toolId === 'uuid') {
            content.innerHTML = `
                <h2>🆔 UUID生成 (Generator)</h2>
                <div class="tool-form" style="display:flex; flex-direction:column; align-items:center;">
                    <p>利用可能なランダムUUIDを生成します。</p>
                    <button class="neon-btn large" onclick="app.generateUUID()">生成 (Generate)</button>
                    <div id="uuid-result" class="result-box hidden" style="font-size:1.5em; text-align:center;"></div>
                    <button class="copy-btn-tool" onclick="app.copyToolResult('uuid-result')">Copy</button>
                </div>
            `;
        } else if (toolId === 'id_list') {
            this.renderIdListTool(content);
        }
    },

    updatePreview() {
        const text = document.getElementById('json-text').value || 'Sample Text';
        const color = document.getElementById('json-color').value;
        const bold = document.getElementById('json-bold').checked;
        const italic = document.getElementById('json-italic').checked;

        const previewEl = document.getElementById('live-preview');
        previewEl.innerText = text;
        previewEl.style.color = color;
        previewEl.style.fontWeight = bold ? 'bold' : 'normal';
        previewEl.style.fontStyle = italic ? 'italic' : 'normal';
    },

    generateSign() {
        const l1 = document.getElementById('sign-l1').value;
        const l2 = document.getElementById('sign-l2').value;
        const cmd = document.getElementById('sign-cmd').value;

        // /give @p oak_sign{BlockEntityTag:{Text1:'{"text":"L1"}',Text2:'{"text":"L2","clickEvent":{...}}'}}
        const clickTag = cmd ? `,"clickEvent":{"action":"run_command","value":"${cmd}"}` : '';
        const nbt = `{BlockEntityTag:{Text1:'{"text":"${l1}"}',Text2:'{"text":"${l2}"${clickTag}}',Text3:'{"text":""}',Text4:'{"text":""}'}}`;

        const finalCmd = `/give @p oak_sign${nbt} 1`;

        const resultBox = document.getElementById('sign-result');
        resultBox.innerText = finalCmd;
        resultBox.classList.remove('hidden');
    },

    closeTool() {
        document.getElementById('tool-modal').classList.add('hidden');
    },

    generateItem() {
        const id = document.getElementById('item-id').value || 'minecraft:stone';
        const name = document.getElementById('item-name').value;
        const lore = document.getElementById('item-lore').value;
        const enchId = document.getElementById('ench-id').value;
        const enchLvl = document.getElementById('ench-lvl').value;
        const unbreakable = document.getElementById('item-unbreakable').checked;

        let nbt = {};
        let display = {};

        if (name) display.Name = `'{"text":"${name}"}'`;
        if (lore) display.Lore = [`'{"text":"${lore}"}'`];

        if (Object.keys(display).length > 0) nbt.display = display;
        if (unbreakable) nbt.Unbreakable = 1;
        if (enchId) nbt.Enchantments = [{ id: enchId, lvl: parseInt(enchLvl) }];

        // Format NBT (Simplified)
        let nbtStr = JSON.stringify(nbt);
        // Clean up quotes for keys to look more like MC NBT (optional but nice)
        nbtStr = nbtStr.replace(/"([^"]+)":/g, '$1:');

        const cmd = `/give @p ${id}${nbtStr} 1`;

        const resBox = document.getElementById('item-result');
        resBox.innerText = cmd;
        resBox.classList.remove('hidden');
    },

    generateUUID() {
        // UUID v4
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        const resBox = document.getElementById('uuid-result');
        resBox.innerText = uuid;
        resBox.classList.remove('hidden');
    },

    generateJson() {
        const text = document.getElementById('json-text').value;
        const color = document.getElementById('json-color').value;
        const bold = document.getElementById('json-bold').checked;
        const italic = document.getElementById('json-italic').checked;
        const clickAction = document.getElementById('json-click').value;
        const clickVal = document.getElementById('json-click-val').value;

        let obj = { text: text, color: color };
        if (bold) obj.bold = true;
        if (italic) obj.italic = true;
        if (clickAction !== 'none' && clickVal) {
            obj.clickEvent = { action: clickAction, value: clickVal };
        }

        const jsonStr = JSON.stringify(obj);
        const resultBox = document.getElementById('json-result');
        resultBox.innerText = `/tellraw @a ${jsonStr}`;
        resultBox.classList.remove('hidden');
    },

    generatePotion() {
        const eff = document.getElementById('pot-effect').value;
        const sec = document.getElementById('pot-sec').value;
        const amp = document.getElementById('pot-amp').value;
        const hide = document.getElementById('pot-hide').checked;
        const ambient = document.getElementById('pot-ambient').checked;

        // /effect give <target> <effect> [seconds] [amplifier] [hideParticles]
        const cmd = `/effect give @p ${eff} ${sec} ${amp} ${hide}`;

        const resultBox = document.getElementById('pot-result');
        resultBox.innerText = cmd;
        resultBox.classList.remove('hidden');
    },

    // --- Reference (Dictionary) with Intelligent Search ---
    searchCommands() {
        let query = document.getElementById('cmd-search').value.toLowerCase();

        // Tag Logic: #tag -> search category
        let categoryFilter = null;
        if (query.startsWith('#')) {
            categoryFilter = query.substring(1); // remove #
            query = ''; // clear query words to show all in category
        }

        /* simple fuzzy mapping for Japanese keywords */
        const fuzzyMap = {
            'テレポート': 'tp', '移動': 'tp',
            '殺す': 'kill', 'キル': 'kill',
            '召喚': 'summon', '出す': 'summon',
            'アイテム': 'give', '与える': 'give',
            '天気': 'weather', '時間': 'time',
            '変数': 'scoreboard', 'スコア': 'scoreboard'
        };

        // If query matches a fuzzy key, append the english command to search
        for (const key in fuzzyMap) {
            if (query.includes(key)) {
                query += ' ' + fuzzyMap[key];
            }
        }

        const filtered = this.commandDB.filter(cmd => {
            // Category Filter
            if (categoryFilter && !cmd.category.toLowerCase().includes(categoryFilter)) {
                return false;
            }
            // Text Search
            if (query) {
                const searchStr = `${cmd.name} ${cmd.desc} ${cmd.category}`.toLowerCase();
                // Check if ALL words in query exist in searchStr
                const words = query.split(' ').filter(w => w.length > 0);
                return words.every(w => searchStr.includes(w));
            }
            return true;
        });

        this.renderCommandList(filtered);
    },

    renderCommandList(list) {
        const container = document.getElementById('cmd-list');
        if (list.length === 0) {
            container.innerHTML = '<div class="ref-item"><p>No commands found.</p></div>';
            return;
        }
        container.innerHTML = list.map(cmd => `
                                                                <div class="ref-item">
                                                                    <h4>${cmd.name} <span class="cmd-cat-tag">#${cmd.category}</span></h4>
                                                                    <p class="ref-desc">${cmd.desc}</p>
                                                                    <div class="code-container">
                                                                        <pre class="block"><code>${cmd.syntax}</code></pre>
                                                                        <button class="copy-btn" onclick="app.copyCode(this, '${cmd.syntax.replace(/'/g, "\\'")}')">Copy</button>
                                                                </div>
                                                            </div>
                                                                `).join('');
    },

    // --- ID List Logic ---
    renderIdListTool(container) {
        container.innerHTML = `
            <h2>📚 ID Dictionary</h2>
            <div class="id-list-container">
                <div class="id-tabs">
                    <button class="id-tab active" onclick="app.switchIdTab('items')">Items</button>
                    <button class="id-tab" onclick="app.switchIdTab('enchants')">Enchants</button>
                    <button class="id-tab" onclick="app.switchIdTab('effects')">Effects</button>
                </div>
                <div class="id-search-box">
                    <input type="text" id="id-search" class="glass-input" placeholder="Search IDs..." oninput="app.searchIds()">
                </div>
                <div class="id-scroll-area" id="id-list-content">
                    <!-- filled by js -->
                </div>
            </div>
        `;
        this.currentIdTab = 'items';
        this.renderIdItems();
    },

    switchIdTab(tab) {
        this.currentIdTab = tab;
        document.querySelectorAll('.id-tab').forEach(t => t.classList.remove('active'));
        const index = ['items', 'enchants', 'effects'].indexOf(tab);
        if (document.querySelectorAll('.id-tab')[index]) {
            document.querySelectorAll('.id-tab')[index].classList.add('active');
        }

        this.renderIdItems();
    },

    renderIdItems() {
        const query = (document.getElementById('id-search')?.value || '').toLowerCase();
        const list = this.idData[this.currentIdTab];
        const container = document.getElementById('id-list-content');
        if (!container) return;
        container.innerHTML = '';

        const filetered = list.filter(item => {
            return item.id.includes(query) || item.name.toLowerCase().includes(query);
        });

        filetered.forEach(item => {
            const el = document.createElement('div');
            el.className = 'id-item';
            el.onclick = () => app.copyText(item.id);
            el.innerHTML = `
                <span class="id-name">${item.name}</span>
                <span class="id-code">${item.id}</span>
            `;
            container.appendChild(el);
        });
    },

    searchIds() {
        this.renderIdItems();
    },

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (this.showToast) this.showToast('Copied: ' + text, '📋');
            else alert('Copied: ' + text);
        });
    },

    // --- Data for ID List ---
    idData: {
        items: [
            { id: 'minecraft:command_block', name: 'Command Block', ja: 'コマンドブロック' },
            { id: 'minecraft:stone', name: 'Stone', ja: '石' },
            { id: 'minecraft:dirt', name: 'Dirt', ja: '土' },
            { id: 'minecraft:grass_block', name: 'Grass Block', ja: '草ブロック' },
            { id: 'minecraft:diamond_sword', name: 'Diamond Sword', ja: 'ダイヤモンドの剣' },
            { id: 'minecraft:netherite_ingot', name: 'Netherite Ingot', ja: 'ネザライトインゴット' },
            { id: 'minecraft:barrier', name: 'Barrier', ja: 'バリアブロック' },
            { id: 'minecraft:debug_stick', name: 'Debug Stick', ja: 'デバッグ棒' },
            { id: 'minecraft:structure_block', name: 'Structure Block', ja: 'ストラクチャーブロック' },
            { id: 'minecraft:chest', name: 'Chest', ja: 'チェスト' },
            { id: 'minecraft:stick', name: 'Stick', ja: '棒' },
            { id: 'minecraft:redstone_block', name: 'Redstone Block', ja: 'レッドストーンブロック' },
            { id: 'minecraft:observer', name: 'Observer', ja: 'オブザーバー' },
            { id: 'minecraft:beacon', name: 'Beacon', ja: 'ビーコン' },
            { id: 'minecraft:end_rod', name: 'End Rod', ja: 'エンドロッド' },
            { id: 'minecraft:elytra', name: 'Elytra', ja: 'エリトラ' },
            { id: 'minecraft:firework_rocket', name: 'Firework Rocket', ja: 'ロケット花火' },
            { id: 'minecraft:totem_of_undying', name: 'Totem of Undying', ja: '不死のトーテム' },
            { id: 'minecraft:golden_apple', name: 'Golden Apple', ja: '金のリンゴ' },
            { id: 'minecraft:enchanted_golden_apple', name: 'Enchanted Golden Apple', ja: 'エンチャントされた金のリンゴ' },
            { id: 'minecraft:name_tag', name: 'Name Tag', ja: '名札' },
            { id: 'minecraft:armor_stand', name: 'Armor Stand', ja: '防具立て' },
            { id: 'minecraft:iron_golem_spawn_egg', name: 'Iron Golem Spawn Egg', ja: 'アイアンゴーレムのスポーンエッグ' },
            // Colored Blocks
            { id: 'minecraft:white_wool', name: 'White Wool', ja: '白色の羊毛' },
            { id: 'minecraft:red_wool', name: 'Red Wool', ja: '赤色の羊毛' },
            { id: 'minecraft:blue_wool', name: 'Blue Wool', ja: '青色の羊毛' },
            { id: 'minecraft:white_concrete', name: 'White Concrete', ja: '白色のコンクリート' },
            { id: 'minecraft:black_concrete', name: 'Black Concrete', ja: '黒色のコンクリート' },
            { id: 'minecraft:red_concrete', name: 'Red Concrete', ja: '赤色のコンクリート' },
            { id: 'minecraft:glass', name: 'Glass', ja: 'ガラス' },
            { id: 'minecraft:tinted_glass', name: 'Tinted Glass', ja: '遮光ガラス' },
            // Music Discs
            { id: 'minecraft:music_disc_13', name: 'Music Disc (13)', ja: 'レコード (13)' },
            { id: 'minecraft:music_disc_cat', name: 'Music Disc (cat)', ja: 'レコード (cat)' },
            { id: 'minecraft:music_disc_pigstep', name: 'Music Disc (Pigstep)', ja: 'レコード (Pigstep)' },
            // Functional
            { id: 'minecraft:hopper', name: 'Hopper', ja: 'ホッパー' },
            { id: 'minecraft:dispenser', name: 'Dispenser', ja: 'ディスペンサー' },
            { id: 'minecraft:dropper', name: 'Dropper', ja: 'ドロッパー' },
            { id: 'minecraft:piston', name: 'Piston', ja: 'ピストン' },
            { id: 'minecraft:sticky_piston', name: 'Sticky Piston', ja: '粘着ピストン' },
            { id: 'minecraft:lever', name: 'Lever', ja: 'レバー' },
            { id: 'minecraft:obsidian', name: 'Obsidian', ja: '黒曜石' },
            { id: 'minecraft:crying_obsidian', name: 'Crying Obsidian', ja: '泣く黒曜石' }
        ],
        entities: [
            { id: 'minecraft:zombie', name: 'Zombie', ja: 'ゾンビ' },
            { id: 'minecraft:skeleton', name: 'Skeleton', ja: 'スケルトン' },
            { id: 'minecraft:creeper', name: 'Creeper', ja: 'クリーパー' },
            { id: 'minecraft:spider', name: 'Spider', ja: 'クモ' },
            { id: 'minecraft:enderman', name: 'Enderman', ja: 'エンダーマン' },
            { id: 'minecraft:villager', name: 'Villager', ja: '村人' },
            { id: 'minecraft:pig', name: 'Pig', ja: '豚' },
            { id: 'minecraft:cow', name: 'Cow', ja: '牛' },
            { id: 'minecraft:sheep', name: 'Sheep', ja: '羊' },
            { id: 'minecraft:chicken', name: 'Chicken', ja: '鶏' },
            { id: 'minecraft:armor_stand', name: 'Armor Stand', ja: '防具立て' },
            { id: 'minecraft:item_frame', name: 'Item Frame', ja: '額縁' },
            { id: 'minecraft:boat', name: 'Boat', ja: 'ボート' },
            { id: 'minecraft:minecart', name: 'Minecart', ja: 'トロッコ' },
            { id: 'minecraft:tnt', name: 'TNT', ja: 'TNT' },
            { id: 'minecraft:falling_block', name: 'Falling Block', ja: '落下ブロック' }
        ],
        particles: [
            { id: 'minecraft:flame', name: 'Flame', ja: '炎' },
            { id: 'minecraft:heart', name: 'Heart', ja: 'ハート' },
            { id: 'minecraft:explosion', name: 'Explosion', ja: '爆発' },
            { id: 'minecraft:cloud', name: 'Cloud', ja: '雲' },
            { id: 'minecraft:note', name: 'Note', ja: '音符' },
            { id: 'minecraft:crit', name: 'Crit', ja: 'クリティカル' },
            { id: 'minecraft:enchant', name: 'Enchant', ja: 'エンチャント文字' },
            { id: 'minecraft:portal', name: 'Portal', ja: 'ポータル' },
            { id: 'minecraft:soul_fire_flame', name: 'Soul Fire Flame', ja: '青い炎' },
            { id: 'minecraft:dragon_breath', name: 'Dragon Breath', ja: 'ドラゴンの息' },
            { id: 'minecraft:end_rod', name: 'End Rod', ja: 'エンドロッドの光' },
            { id: 'minecraft:firework', name: 'Firework', ja: '花火' },
            { id: 'minecraft:flash', name: 'Flash', ja: 'フラッシュ' },
            { id: 'minecraft:totem_of_undying', name: 'Totem', ja: 'トーテム発動' }
        ],
        enchants: [
            { id: 'minecraft:sharpness', name: 'Sharpness', ja: 'ダメージ増加 (鋭さ)' },
            { id: 'minecraft:knockback', name: 'Knockback', ja: 'ノックバック' },
            { id: 'minecraft:infinity', name: 'Infinity', ja: '無限' },
            { id: 'minecraft:mending', name: 'Mending', ja: '修繕' },
            { id: 'minecraft:unbreaking', name: 'Unbreaking', ja: '耐久力' },
            { id: 'minecraft:fortune', name: 'Fortune', ja: '幸運' },
            { id: 'minecraft:silk_touch', name: 'Silk Touch', ja: 'シルクタッチ' },
            { id: 'minecraft:looting', name: 'Looting', ja: 'ドロップ増加' },
            { id: 'minecraft:protection', name: 'Protection', ja: 'ダメージ軽減' },
            { id: 'minecraft:feather_falling', name: 'Feather Falling', ja: '落下耐性' },
            { id: 'minecraft:efficiency', name: 'Efficiency', ja: '効率強化' },
            { id: 'minecraft:power', name: 'Power', ja: '射撃ダメージ増加' },
            { id: 'minecraft:punch', name: 'Punch', ja: 'パンチ (衝撃)' },
            { id: 'minecraft:flame', name: 'Flame', ja: 'フレイム (火矢)' },
            { id: 'minecraft:thorns', name: 'Thorns', ja: '棘の鎧' },
            { id: 'minecraft:sweeping', name: 'Sweeping Edge', ja: '範囲ダメージ増加' }
        ],
        effects: [
            { id: 'minecraft:speed', name: 'Speed', ja: '移動速度上昇' },
            { id: 'minecraft:strength', name: 'Strength', ja: '攻撃力上昇' },
            { id: 'minecraft:instant_health', name: 'Instant Health', ja: '即時回復' },
            { id: 'minecraft:instant_damage', name: 'Instant Damage', ja: '即時ダメージ' },
            { id: 'minecraft:invisibility', name: 'Invisibility', ja: '透明化' },
            { id: 'minecraft:regeneration', name: 'Regeneration', ja: '再生能力' },
            { id: 'minecraft:resistance', name: 'Resistance', ja: '耐性' },
            { id: 'minecraft:fire_resistance', name: 'Fire Resistance', ja: '火炎耐性' },
            { id: 'minecraft:water_breathing', name: 'Water Breathing', ja: '水中呼吸' },
            { id: 'minecraft:night_vision', name: 'Night Vision', ja: '暗視' },
            { id: 'minecraft:levitation', name: 'Levitation', ja: '浮遊' },
            { id: 'minecraft:glowing', name: 'Glowing', ja: '発光' },
            { id: 'minecraft:haste', name: 'Haste', ja: '急迫 (採掘速度上昇)' },
            { id: 'minecraft:absorption', name: 'Absorption', ja: '衝撃吸収' },
            { id: 'minecraft:blindness', name: 'Blindness', ja: '盲目' },
            { id: 'minecraft:nausea', name: 'Nausea', ja: '吐き気' },
            { id: 'minecraft:poison', name: 'Poison', ja: '毒' },
            { id: 'minecraft:wither', name: 'Wither', ja: 'ウィザー' },
            { id: 'minecraft:slow_falling', name: 'Slow Falling', ja: '低速落下' },
            { id: 'minecraft:dolphins_grace', name: 'Dolphins Grace', ja: 'イルカの好意' },
            { id: 'minecraft:conduit_power', name: 'Conduit Power', ja: 'コンジットパワー' }
        ]
    },

    // --- ID List Logic ---
    renderIdDictionary() {
        if (!this.currentIdTab) this.currentIdTab = 'items';
        this.renderIdItems();
    },

    switchIdTab(tab) {
        this.currentIdTab = tab;
        document.querySelectorAll('.id-tab').forEach(t => t.classList.remove('active'));
        const index = ['items', 'entities', 'enchants', 'effects', 'particles'].indexOf(tab);
        if (document.querySelectorAll('.id-tab')[index]) {
            document.querySelectorAll('.id-tab')[index].classList.add('active');
        }

        this.renderIdItems();
    },

    renderIdItems() {
        const query = (document.getElementById('id-search')?.value || '').toLowerCase();
        const list = this.idData[this.currentIdTab] || [];
        const container = document.getElementById('id-list-content');
        if (!container) return;
        container.innerHTML = '';

        const filetered = list.filter(item => {
            const ja = (item.ja || '').toLowerCase();
            return item.id.includes(query) ||
                item.name.toLowerCase().includes(query) ||
                ja.includes(query);
        });

        filetered.forEach(item => {
            const el = document.createElement('div');
            el.className = 'id-item';
            el.onclick = () => app.copyText(item.id);
            el.innerHTML = `
                <div>
                    <span class="id-name">${item.ja || item.name}</span>
                    <span class="id-jp-name" style="font-size:0.85em; color:#888; margin-left:8px;">${item.ja ? item.name : ''}</span>
                </div>
                <span class="id-code">${item.id}</span>
            `;
            container.appendChild(el);
        });
    },

    searchIds() {
        this.renderIdItems();
    },

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (this.showToast) this.showToast('Copied: ' + text, '📋');
            else alert('Copied: ' + text);
        });
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

