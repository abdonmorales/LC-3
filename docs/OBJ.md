# LC3Tools Object File Format

LC3Tools `.obj` files are binary files produced by the assembler and binary
converter, then consumed by the simulator loader. An object file contains a
fixed header, a fixed version, and a sequence of memory records that continue
until end of file.

All multi-byte integers in the current implementation are written by copying the
native C++ integer representation directly into the file. On the supported
little-endian builds, the byte layouts below are the bytes emitted and accepted.

## File Layout

| File offset | Size | Bytes | Meaning |
| --- | ---: | --- | --- |
| `0x0000` | 5 | `1c 30 15 c0 01` | Magic header. |
| `0x0005` | 2 | `01 01` | Object format version. |
| `0x0007` | variable | records | Zero or more memory records, read until EOF. |

The loader rejects files whose magic header or version bytes do not exactly
match the values above.

## Memory Record Layout

Each memory record starts immediately after the previous record. Its total size
is `7 + line_length` bytes.

| Record offset | Size | Field | Byte layout |
| --- | ---: | --- | --- |
| `+0` | 2 | `value` | Unsigned 16-bit little-endian value. |
| `+2` | 1 | `is_orig` | Boolean byte: `01` for an origin record, `00` for a data record. |
| `+3` | 4 | `line_length` | Unsigned 32-bit little-endian count of following line bytes. |
| `+7` | `line_length` | `line` | Raw source-line bytes, not null-terminated. |

The `line` field is not needed to load memory. It embeds source code context
that lets downstream tools show meaningful source text when they only have an
`.obj` file. Assembler output stores the original source line for most records,
with `.STRINGZ` character records storing the individual character byte as a
one-character line. The binary converter stores the 16-character binary input
line for each record.

### Origin Records

An origin record has `is_orig = 01`. Its `value` field is the address that the
following data records should be loaded at.

When the simulator sees an origin record, it sets the current load address to
`value` and resets the per-region offset to zero. The first origin record also
sets the simulator reset PC, unless the origin address is `x0000`; that special
case is used when loading the LC-3 operating system and does not change the
reset PC.

The assembler emits one origin record for each `.ORIG` directive. `.END`
directives do not produce records.

### Data Records

A data record has `is_orig = 00`. Its `value` field is the 16-bit word written
to memory at the current load address plus the current offset. After writing a
data record, the loader increments the offset by one.

Assembler output uses data records for instructions and data-producing
pseudo-ops:

| Source construct | Emitted records |
| --- | --- |
| Instruction | One data record with the encoded instruction word. |
| `.FILL` | One data record with the fill value. |
| `.BLKW n` | `n` data records, each with value `0000`. |
| `.STRINGZ "..."` | One data record per character, followed by one `0000` terminator record. |

The binary converter emits the first non-empty binary line as an origin record
and every later non-empty binary line as a data record.

## Byte Order

For the current little-endian builds:

| Numeric value | Bytes in file |
| --- | --- |
| `0x3000` as a 16-bit `value` | `00 30` |
| `0x1021` as a 16-bit `value` | `21 10` |
| `14` as a 32-bit `line_length` | `0e 00 00 00` |

Disclaimer: the loader does not define a portable big-endian encoding. It writes
and reads `uint16_t`, `bool`, and `uint32_t` fields using the host
representation.

## Example

For this source:

```asm
.ORIG x3000
ADD R0, R0, #1
HALT
.END
```

the object file begins with the fixed header and version:

```text
1c 30 15 c0 01  01 01
```

Then the `.ORIG x3000` origin record is:

```text
00 30  01  0b 00 00 00  2e 4f 52 49 47 20 78 33 30 30 30
^^^^^  ^^  ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
value  orig line length  ".ORIG x3000"
```

The `ADD R0, R0, #1` data record is:

```text
21 10  00  0e 00 00 00  41 44 44 20 52 30 2c 20 52 30 2c 20 23 31
^^^^^  ^^  ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
value  data line length  "ADD R0, R0, #1"
```

The `HALT` data record is:

```text
25 f0  00  04 00 00 00  48 41 4c 54
^^^^^  ^^  ^^^^^^^^^^^  ^^^^^^^^^^^
value  data line length  "HALT"
```
