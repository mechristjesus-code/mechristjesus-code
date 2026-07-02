# Skill: var-syntax

**Doc Variables Syntax** — Document Automation Variable System

A comprehensive reference for document variable syntax used to automate,
personalize, and add conditional logic to dynamic documents. Covers all
variable types from basic text substitution to advanced calculated fields,
conditional logic, security masking, and financial formatting.

---

## Core Variable Types

### 1. Standard Text Variable
```
${[VARIABLE_NAME]}
${FirstName}
${Client.FirstName} ${Client.LastName}
```

### 2. Required Variable (*)
```
${*[VARIABLE_NAME]}
${*TotalAmount::currency::USD}
```
Document cannot be processed if this field is empty.

### 3. Default Value (~)
```
${[VARIABLE_NAME]::~[DEFAULT]}
${IncludeSig::boolean::~true}
${Link::url::~https://example.com}
```

### 4. Text Transforms
```
${Name::transform::uppercase}
${Name::transform::lowercase}
${Name::transform::titlecase}
```

---

## Data Type Syntax

### Boolean (Checkbox)
```
${[VARIABLE_NAME]::boolean}
${[VARIABLE_NAME]::bool}

Example:
  ${IncludeSig::boolean::~true}
```

### Number
```
${[VARIABLE_NAME]::number}
${Priority::number}
${BaseRate::number}
```

### Date & Time
```
${[VARIABLE_NAME]::date::[FORMAT]}
${ContractDate::date::MM/DD/YYYY}
${Date::date::dddd, MMMM Do YYYY}
${EffDate::d::MM/YY}
${Time::date::HH:mm}
${Year::date::YYYY}
```

### Currency
```
${[VARIABLE_NAME]::currency::[LOCALE]}
${Investment::currency::US}       → $1,250.50
${Price::currency::EUR}           → €1.234,56
${Price::currency::GBP}           → £1,234.56
${Balance::currency::USD::accounting}
${Amount::text-to-words}          → "One thousand two hundred fifty"
```

### URL / Email
```
${Link::url::~https://...}
${Contact::email}
```

### Range (Slider)
```
${[VARIABLE_NAME]::range::[MIN],[MAX],[STEP]}
${Priority::range::1,10,1}
${S2_Sustainability::range::1,100,5}
```

### Masked Input (Privacy)
```
${[VARIABLE_NAME]::text::mask}
${SecretCode::text::mask}   → ********
${TaxID::text::mask}
${CustomerID::text::mask}
```

### Textarea
```
${[VARIABLE_NAME]::textarea}
${*True_North_Vision::textarea}
${a1::textarea::~Initial Thought}
```

### Hidden Variable
```
${[VARIABLE_NAME]::hidden}
${InternalID::hidden}
${Pattern_Hash::hidden::transform::lowercase}
```

---

## Options & Selection

### Dropdown Options
```
${[VARIABLE_NAME]::options::"Option1","Option2","Option3"}
${Priority::options::"Critical","Standard","Low"}
${PaymentTerms::options::"Net 30","Due on Receipt","Grace Period"}
${JobCategory::options::"Leadership","Integration","Support"}
```

### Output Value Mapping (ov)
```
${[VAR]::ov::"value1":"display1","value2":"display2"}
${ClientCategory::ov::"Individual":"Soul","Corporate":"Entity"}
${Strategic_Alignment::ov::"High":"Synchronized","Medium":"Calibrating","Low":"Misaligned"}
```

### List / Array (Comma-separated)
```
${[VAR]::list-comma::"item1","item2","item3"}
${Interests::list-comma::"Growth","Security","Adventure","Stability"}
→ Output: Growth, Adventure, Stability
```

---

## Conditional Logic

### Basic If/Then
```
?{{[VARIABLE_NAME]}(OPERATOR)[VALUE]::[OUTPUT_IF_TRUE]}
```

**Operators:**
| Operator | Meaning |
|---|---|
| `(==)` | Equals |
| `(!=)` | Not Equals |
| `(>)` | Greater Than |
| `(<)` | Less Than |
| `(>=)` | Greater Than or Equal |
| `(<=)` | Less Than or Equal |

**Examples:**
```
?{{RelationshipStatus}(==)Married::We acknowledge ${Spouse1} and ${Spouse2}.}

?{{IncludeSig}(==)true::Please sign below:}

?{{ThreatLevel}(>)7::[[EMERGENCY_LOCKDOWN_ACTIVE]]::Status: Harmony Secured.}

?{{Budget}(>=){Quote}::We have the abundance to proceed.::We must cultivate more resources.}
```

### If/Then/Else
```
?{{VAR}(OPERATOR)VALUE::OUTPUT_IF_TRUE::OUTPUT_IF_FALSE}
```

### Multi-Tier Switch (Ladder)
```
?{{Annual_Revenue}(>)1000000::Elite Legacy Tier
  ::?{{Annual_Revenue}(>)500000::Growth Tier
  ::Foundation Tier}}
```

---

## Calculated Variables

### Arithmetic
```
={{[VAR_1]} [OPERATOR] {[VAR_2]}}

Operators: (+) (-) (*) (/)

Examples:
  Total Days:  ={{EndDate}(-){StartDate}}
  Total:       ={{Quantity}(*){UnitPrice}}
  Sum:         ={{Var1}(+){Var2}}
  Ratio:       ={{Asset_Value}/{Total_Liability}}
```

### Hidden Calculated
```
${Deposit::hidden::={{TotalAmount}(*).20}}
${Balance::hidden::={{TotalAmount}(-){Deposit}}}
${TotalAbundance::hidden::={{CostPerHour}(*){HoursPerDay}}}
```

### Resilience / Runway Calculation
```
${Resilience_Days::number}
Syntax: ={{ {Liquid_Assets::$}/ {Monthly_Burn_Rate::$}}}
```

---

## Grouping & Scope

```
${[GROUP_NAME].[VARIABLE_NAME]}
${Client.FirstName}
${Client.LastName}
${Partner.Email}
```

---

## System / Metadata Variables

```
${system::date}          → January 9, 2026
${system::time}          → 14:30
${system::user_email}    → alex@example.com
${system::doc_name}      → Contract_2026.pdf
${system::page_count}    → 12
```

---

## Global Variables

```
${global::[VARIABLE_NAME]}
${global::CompanyName}
${global::BrandColor}
```

---

## Table Variables

```
[[TABLE_START]]
| ${ItemName} | ${Quantity} | ${Price} |
[[TABLE_END]]
```
Supports dynamic row addition. Each row reuses the variable names.

---

## Variable-in-Variable (Dynamic Reference)

```
${${UserRole}_Permissions}
→ If UserRole = "Admin" → pulls ${Admin_Permissions}
```

---

## Advanced Security Variables

```
${Doc_Integrity_Hash::hidden::transform::uppercase}
${User_Clearance::options::"Public","Internal","Confidential","Top Secret"}
${Secret_Key::text::mask}
${Pattern_Recognition_ID::hidden}
```

### Self-Expiring Variable
```
?{{system::date}(<)${ExpiryDate}::${Secret_Value}::[DATA EXPIRED]}
```

---

## Master Summary Table

| Variable Type | Syntax | Purpose |
|---|---|---|
| Standard | `${Name}` | Text substitution |
| Required | `${*Name}` | Cannot be empty |
| Default | `${Name::~value}` | Fallback if blank |
| Boolean | `${Flag::boolean}` | Checkbox true/false |
| Number | `${Qty::number}` | Numeric input |
| Currency | `${Amt::currency::USD}` | Formatted money |
| Date | `${Date::date::MM/DD/YYYY}` | Formatted date |
| Time | `${Time::date::HH:mm}` | Formatted time |
| Textarea | `${Notes::textarea}` | Multi-line text |
| Masked | `${Code::text::mask}` | Hidden input |
| Hidden | `${ID::hidden}` | Logic-only, not printed |
| Options | `${Type::options::"A","B"}` | Dropdown selection |
| Range | `${Score::range::1,10,1}` | Slider |
| List | `${Tags::list-comma::"a","b"}` | Multi-select |
| Transform | `${Name::transform::titlecase}` | Case conversion |
| Calculated | `={{Var1}(+){Var2}}` | Math expression |
| Conditional | `?{{Var}(==)val::output}` | If/then logic |
| Group | `${Client.Name}` | Scoped variable |
| Global | `${global::VarName}` | Site-wide value |
| System | `${system::date}` | Auto metadata |
| Table | `[[TABLE_START]]…[[TABLE_END]]` | Dynamic rows |

---

## Naming Conventions

Use **PascalCase** or **camelCase** for variable names:
```
${ClientFirstName}    ✅
${client_first_name}  ✅
${clientfirstname}    ❌ (hard to read)
```

Group related variables with dot notation:
```
${Client.FirstName}
${Client.LastName}
${Client.Email}
${Contract.StartDate}
${Contract.EndDate}
```
