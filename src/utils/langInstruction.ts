export const englishInstructions = `
Generate exactly one Git commit message from DIFF_SUMMARY and RAW_DIFF using an accurate, code-centric imperative style.

Rules:
1. Output exactly one raw line in this format: <type>(<scope>): <description>
2. Use only these lowercase types: feat, fix, refactor, chore, docs, style, test, perf.
3. Select the type from the actual code-level change:
   - feat: add new externally usable behavior
   - fix: correct incorrect behavior
   - refactor: restructure code without changing intended behavior
   - chore: update tooling, dependencies, configuration, or maintenance code
   - docs: change documentation only
   - style: change formatting only, with no logic change
   - test: add or modify tests only
   - perf: improve runtime or resource efficiency
4. Determine the scope mechanically:
   - For one changed file, use its exact filename, including its extension.
   - For multiple changed files, use the exact deepest common parent folder provided by scope_hint.
   - Preserve native casing.
   - Remove path separators from the final scope.
   - Never infer or invent a feature, layer, component, or subsystem name.
5. Start the description with a lowercase imperative verb, such as add, use, remove, replace, rename, extract, move, handle, validate, or update.
6. Describe the concrete code operation, not its motivation or outcome.
7. Reference exact identifiers from the diff whenever they identify the core change, including methods, functions, classes, interfaces, types, APIs, config keys, endpoints, dependencies, commands, status codes, and error codes.
8. Preserve identifier spelling, punctuation, and acronym casing exactly as shown in the diff.
9. Prefer the root technical mechanism over secondary effects. When several edits implement one change, describe the shared structural operation.
10. When the diff contains unrelated changes, describe only the most significant code-level change.
11. Avoid vague nouns and verbs such as logic, handling, behavior, changes, improve, enhance, adjust, modify, or update unless no more precise operation appears in the diff.
12. Remove narrative phrasing, filler, rationales, consequences, fallback explanations, and purpose clauses, including phrases such as "to support", "in order to", "so that", "for 401 errors", or "when needed".
13. Do not mention filenames in the description unless the filename itself is the changed technical artifact.
14. Do not repeat the scope in the description.
15. Do not use past tense, progressive tense, sentence-ending punctuation, or title case.
16. Do not output Markdown, backticks, diff content, file counts, explanations, alternatives, prefixes, suffixes, or code blocks.
`;

export const russianInstructions = `
Создайте ровно одно сообщение коммита Git на основе DIFF_SUMMARY и RAW_DIFF, используя точный, ориентированный на код повелительный стиль.

Правила:
1. Выведите ровно одну строку без дополнительного форматирования: <type>(<scope>): <описание>
2. Используйте только следующие типы в нижнем регистре: feat, fix, refactor, chore, docs, style, test, perf.
3. Выбирайте type на основе фактического изменения на уровне кода:
   - feat: добавление нового внешне доступного поведения
   - fix: исправление некорректного поведения
   - refactor: изменение структуры кода без изменения предполагаемого поведения
   - chore: обновление инструментов, зависимостей, конфигурации или служебного кода
   - docs: изменение только документации
   - style: изменение только форматирования без изменения логики
   - test: добавление или изменение только тестов
   - perf: повышение производительности или эффективности использования ресурсов
4. Определяйте scope механически:
   - Если изменен один файл, используйте его точное имя вместе с расширением.
   - Если изменено несколько файлов, используйте точную самую глубокую общую родительскую папку из scope_hint.
   - Сохраняйте исходный регистр.
   - Удаляйте разделители пути из итогового scope.
   - Не придумывайте название функции, слоя, компонента или подсистемы.
5. Начинайте описание со строчного глагола в повелительной форме, например: добавь, используй, удали, замени, переименуй, извлеки, перемести, обработай, проверь или обнови.
6. Описывайте конкретную операцию над кодом, а не ее мотивацию, назначение или результат.
7. Указывайте точные идентификаторы из diff, когда они определяют основное изменение: методы, функции, классы, интерфейсы, типы, API, ключи конфигурации, endpoints, зависимости, команды, status codes и error codes.
8. Сохраняйте написание, пунктуацию и регистр идентификаторов и аббревиатур точно как в diff.
9. Отдавайте приоритет корневому техническому механизму, а не вторичным последствиям. Если несколько правок реализуют одно изменение, описывайте общую структурную операцию.
10. Если diff содержит несвязанные изменения, описывайте только наиболее значимое изменение на уровне кода.
11. Избегайте расплывчатых слов, таких как логика, обработка, поведение, изменения, улучшить, расширить, скорректировать, модифицировать или обновить, если в diff доступна более точная операция.
12. Удаляйте повествовательные формулировки, заполнители, обоснования, последствия, резервные объяснения и конструкции цели, аналогичные фразам «для поддержки», «чтобы», «для ошибок 401» или «при необходимости».
13. Не упоминайте имена файлов в описании, если сам файл не является изменяемым техническим артефактом.
14. Не повторяйте scope в описании.
15. Не используйте прошедшее время, продолженную форму, завершающую пунктуацию или заглавную букву в начале описания.
16. Не выводите Markdown, обратные кавычки, содержимое diff, количество файлов, пояснения, альтернативы, префиксы, суффиксы или блоки кода.
17. Пишите описание на русском языке, сохраняя точные идентификаторы из diff без перевода.
`;

export const japanInstructions = `
DIFF_SUMMARY と RAW_DIFF から、正確でコード中心の命令形スタイルを使用して、Git コミットメッセージを厳密に1つ生成してください。

ルール:
1. 次の形式の未加工の1行だけを出力してください: <type>(<scope>): <説明>
2. type には次の小文字だけを使用してください: feat, fix, refactor, chore, docs, style, test, perf.
3. 実際のコードレベルの変更に基づいて type を選択してください:
   - feat: 外部から利用可能な新しい動作を追加する
   - fix: 誤った動作を修正する
   - refactor: 意図された動作を変えずにコード構造を変更する
   - chore: ツール、依存関係、設定、または保守コードを更新する
   - docs: ドキュメントだけを変更する
   - style: ロジックを変えずに書式だけを変更する
   - test: テストだけを追加または変更する
   - perf: 実行速度またはリソース効率を改善する
4. scope は機械的に決定してください:
   - 変更ファイルが1つの場合は、拡張子を含む正確なファイル名を使用してください。
   - 複数ファイルの場合は、scope_hint に示された最も深い共通親フォルダーをそのまま使用してください。
   - 元の大文字小文字を保持してください。
   - 最終的な scope からパス区切り文字を除去してください。
   - 機能、レイヤー、コンポーネント、またはサブシステム名を推測したり作成したりしないでください。
5. 説明は、追加する、使用する、削除する、置換する、名前変更する、抽出する、移動する、処理する、検証する、更新する、などの命令的な動詞で開始してください。
6. 動機、目的、結果ではなく、具体的なコード操作を記述してください。
7. 中核となる変更を特定する場合は、diff にある正確な識別子を使用してください。対象には、メソッド、関数、クラス、インターフェース、型、API、設定キー、endpoint、依存関係、コマンド、status code、error code が含まれます。
8. 識別子のスペル、句読点、略語の大文字小文字を diff の表記どおりに保持してください。
9. 二次的な効果ではなく、根本的な技術メカニズムを優先してください。複数の編集が1つの変更を実装する場合は、共通する構造的操作を記述してください。
10. diff に無関係な変更が含まれる場合は、最も重要なコードレベルの変更だけを記述してください。
11. diff により正確な操作が示されている場合は、logic、handling、behavior、changes、improve、enhance、adjust、modify、update に相当する曖昧な表現を避けてください。
12. 物語的な表現、冗長語、理由、結果、代替説明、および「サポートするため」「〜できるように」「401 エラー用」「必要な場合」などの目的節を削除してください。
13. ファイル自体が変更対象の技術的アーティファクトでない限り、説明にファイル名を含めないでください。
14. 説明内で scope を繰り返さないでください。
15. 過去形、進行形、文末の句読点、または不要なタイトルケースを使用しないでください。
16. Markdown、バッククォート、diff の内容、ファイル数、説明、代替案、接頭辞、接尾辞、コードブロックを出力しないでください。
17. 説明は日本語で記述し、diff 内の正確な識別子は翻訳せずに保持してください。
`;

export const koreanInstructions = `
DIFF_SUMMARY와 RAW_DIFF를 기반으로 정확하고 코드 중심적인 명령형 스타일의 Git 커밋 메시지를 정확히 하나 생성하세요.

규칙:
1. 다음 형식의 원시 텍스트 한 줄만 출력하세요: <type>(<scope>): <설명>
2. type은 다음 소문자 값만 사용하세요: feat, fix, refactor, chore, docs, style, test, perf.
3. 실제 코드 수준 변경에 따라 type을 선택하세요:
   - feat: 외부에서 사용할 수 있는 새로운 동작 추가
   - fix: 잘못된 동작 수정
   - refactor: 의도된 동작을 바꾸지 않고 코드 구조 변경
   - chore: 도구, 의존성, 설정 또는 유지보수 코드 업데이트
   - docs: 문서만 변경
   - style: 로직 변경 없이 서식만 변경
   - test: 테스트만 추가하거나 변경
   - perf: 실행 성능 또는 리소스 효율 개선
4. scope는 기계적으로 결정하세요:
   - 변경된 파일이 하나이면 확장자를 포함한 정확한 파일명을 사용하세요.
   - 여러 파일이 변경되었으면 scope_hint에 제공된 가장 깊은 공통 상위 폴더를 정확히 사용하세요.
   - 원래 대소문자를 유지하세요.
   - 최종 scope에서 경로 구분자를 제거하세요.
   - 기능, 계층, 컴포넌트 또는 서브시스템 이름을 추론하거나 새로 만들지 마세요.
5. 설명은 추가, 사용, 제거, 교체, 이름 변경, 추출, 이동, 처리, 검증, 업데이트와 같은 명령형 동작으로 시작하세요.
6. 동기, 목적 또는 결과가 아니라 구체적인 코드 작업을 설명하세요.
7. 핵심 변경을 식별하는 경우 diff의 정확한 식별자를 사용하세요. 여기에는 메서드, 함수, 클래스, 인터페이스, 타입, API, 설정 키, endpoint, 의존성, 명령어, status code, error code가 포함됩니다.
8. 식별자의 철자, 구두점, 약어 대소문자를 diff에 표시된 그대로 유지하세요.
9. 부수적인 효과보다 근본적인 기술 메커니즘을 우선하세요. 여러 편집이 하나의 변경을 구현하면 공통 구조 작업을 설명하세요.
10. diff에 서로 관련 없는 변경이 포함되면 가장 중요한 코드 수준 변경 하나만 설명하세요.
11. diff에서 더 정확한 작업을 확인할 수 있다면 로직, 처리, 동작, 변경, 개선, 향상, 조정, 수정 또는 업데이트와 같은 모호한 표현을 피하세요.
12. 서술형 표현, 불필요한 문구, 근거, 결과, 대체 설명과 함께 "지원하기 위해", "할 수 있도록", "401 오류를 위해", "필요한 경우"와 같은 목적절을 제거하세요.
13. 파일 자체가 변경된 기술적 아티팩트가 아닌 경우 설명에 파일명을 언급하지 마세요.
14. 설명에서 scope를 반복하지 마세요.
15. 과거형, 진행형, 문장 끝 구두점 또는 불필요한 제목식 대문자 표기를 사용하지 마세요.
16. Markdown, 백틱, diff 내용, 파일 수, 설명문, 대안, 접두사, 접미사 또는 코드 블록을 출력하지 마세요.
17. 설명은 한국어로 작성하고 diff의 정확한 식별자는 번역하지 말고 유지하세요.
`;

export const germanInstructions = `
Erzeugen Sie aus DIFF_SUMMARY und RAW_DIFF genau eine Git-Commit-Nachricht in einem präzisen, codezentrierten Imperativstil.

Regeln:
1. Geben Sie genau eine unformatierte Zeile in diesem Format aus: <type>(<scope>): <Beschreibung>
2. Verwenden Sie ausschließlich diese kleingeschriebenen Typen: feat, fix, refactor, chore, docs, style, test, perf.
3. Wählen Sie type anhand der tatsächlichen Änderung auf Codeebene:
   - feat: neues extern nutzbares Verhalten hinzufügen
   - fix: fehlerhaftes Verhalten korrigieren
   - refactor: Codestruktur ändern, ohne das beabsichtigte Verhalten zu verändern
   - chore: Werkzeuge, Abhängigkeiten, Konfiguration oder Wartungscode aktualisieren
   - docs: ausschließlich Dokumentation ändern
   - style: ausschließlich Formatierung ohne Logikänderung ändern
   - test: ausschließlich Tests hinzufügen oder ändern
   - perf: Laufzeit oder Ressourceneffizienz verbessern
4. Bestimmen Sie scope mechanisch:
   - Verwenden Sie bei genau einer geänderten Datei den exakten Dateinamen einschließlich Erweiterung.
   - Verwenden Sie bei mehreren geänderten Dateien den exakten tiefsten gemeinsamen übergeordneten Ordner aus scope_hint.
   - Behalten Sie die ursprüngliche Groß- und Kleinschreibung bei.
   - Entfernen Sie Pfadtrenner aus dem endgültigen scope.
   - Leiten Sie keine Funktions-, Schicht-, Komponenten- oder Subsystembezeichnung ab und erfinden Sie keine.
5. Beginnen Sie die Beschreibung mit einem kleingeschriebenen Verb im Imperativ, beispielsweise füge, verwende, entferne, ersetze, benenne, extrahiere, verschiebe, behandle, validiere oder aktualisiere.
6. Beschreiben Sie die konkrete Codeoperation, nicht deren Motivation, Zweck oder Ergebnis.
7. Verwenden Sie exakte Bezeichner aus dem Diff, wenn sie die Kernänderung identifizieren. Dazu gehören Methoden, Funktionen, Klassen, Interfaces, Typen, APIs, Konfigurationsschlüssel, Endpoints, Abhängigkeiten, Befehle, Statuscodes und Fehlercodes.
8. Behalten Sie Schreibweise, Zeichensetzung und Groß- und Kleinschreibung von Bezeichnern und Akronymen exakt wie im Diff bei.
9. Bevorzugen Sie den grundlegenden technischen Mechanismus gegenüber sekundären Auswirkungen. Wenn mehrere Bearbeitungen eine Änderung umsetzen, beschreiben Sie die gemeinsame strukturelle Operation.
10. Wenn der Diff nicht zusammenhängende Änderungen enthält, beschreiben Sie ausschließlich die bedeutendste Änderung auf Codeebene.
11. Vermeiden Sie ungenaue Wörter wie Logik, Behandlung, Verhalten, Änderungen, verbessern, erweitern, anpassen, modifizieren oder aktualisieren, wenn der Diff eine präzisere Operation enthält.
12. Entfernen Sie narrative Formulierungen, Fülltext, Begründungen, Folgen, Ausweichbeschreibungen und Zwecksätze wie „zur Unterstützung“, „damit“, „für 401-Fehler“ oder „bei Bedarf“.
13. Erwähnen Sie keine Dateinamen in der Beschreibung, außer die Datei selbst ist das geänderte technische Artefakt.
14. Wiederholen Sie scope nicht in der Beschreibung.
15. Verwenden Sie keine Vergangenheitsform, Verlaufsform, abschließende Satzzeichen oder Titelschreibweise.
16. Geben Sie kein Markdown, keine Backticks, keinen Diff-Inhalt, keine Dateianzahl, keine Erklärungen, keine Alternativen, keine Präfixe, keine Suffixe und keine Codeblöcke aus.
17. Schreiben Sie die Beschreibung auf Deutsch und übernehmen Sie exakte Bezeichner aus dem Diff unverändert.
`;

export const englishAssistantInstruction =
    "<type>(<scope>): <description>";

export const russianAssistantInstruction =
    "<type>(<scope>): <описание>";

export const japanAssistantInstruction =
    "<type>(<scope>): <説明>";

export const koreanAssistantInstruction =
    "<type>(<scope>): <설명>";

export const germanAssistantInstruction =
    "<type>(<scope>): <Beschreibung>";