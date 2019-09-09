# Hashfinder Database

[List of Databases](https://github.com/hilbix/hashfinder/wiki) is subject to change.

- A Hashfinder database can reside on any `git` archive which is reachable by `https://`.
- Public Free Hashfinder Databases must reside on any publicly reachable free git repositories.
- Verification of a Public Hashfinder Database is done by community driven CI.
- The Hashfinder preferred CI currenlty is CirrusCI, because it is the only one,
  which is no [Datenkrake](https://de.wikipedia.org/wiki/Datenkrake).


## Format

Each `git` commit contains a single source of authenticity, which is written in the commit message.
For example, a point in time of some repository of some Linux distribution.

Databases can refer to other databases via `git` submodule, too.
This way, the database is as-distributed as `git`.

`git` is only using SHA-1 which is considered weak.  Hence a future additional signature methods will be required.

Each `git` based database has the structure `YYYY/method/reverse-domain/filename.N` with following properties:

- `YYYY` is the current year of the domain, see below what that means.
- `method` is `http`, `https`, `ftp`, `git` etc. of the method of the URL.
- `reverse-domain` is something like `com/example/www` for `www.example.com`
- `filename.N` are files in the hashfinder format
- `filename` is used for the initial prefix.  It must not be empty.
- `.N` is just anything.  `N` does not contain a dot.  Usually it is `.0` and counting up in case that is needed
- Files in a directory which start with a dot `.` are ignored
- Subdirectories are possible and add to the initial Prefix as given

## Year of the domain

- The files in the domain's directory relate to the owner of the domain on first January of the year yyyy (`yyyyZ` which is `yyyy-01-01T00:00:00Z`)
- If the domain was unregistered at that time, it is the first owner after January 1st.

If you update files in the last year, usually delete them and place them in the current year.
This way we know, what's current and what not.

If the files are still completely correct, only place updates in the current year!

This is, the database only contains positive entries.
There are no negative entries (like deleted files).
These are kept in the history of the archive.
At least that is why it is using `git`.


## File format

The file format is simple.  It is

	#comment
	hfv0
	N<TAB>NAME
	MD5<TAB>SHA1<TAB>SHA2<TAB>SHA3<TAB>NAME
	+<TAB>NAME
	-N

- Empty lines do nothing, lines starting with `#`, a `TAB` or `SPC` are ignored.
- `hfv0` stands for hashfinder file version 0.  Note that this format can be anywhere in the file, but it usually preceeds the first line.
- The `N<TAB>NAME` is defining the prefix, starting at backwards-offset `N` (in hex notation) of the previous prefix.
- `NAME` is the name component encoded in UTF-8.
- The hashes used are `MD5` (128), `SHA1` (160), `SHA2-256` (256) and `SHA3-384` (384) in the usual ASCII-HEX notation with lowercase `a-f` preferred.
  - If a hash is not present, it can be written as `-`
- All control characters (`NUL` 0x00 up to `US` 0x1F, as well as `DEL` 0x7f) are disallowed in `NAME`.
- To encode control characters in the `NAME`, following escapement is used:
  - `DLE` (0x10) followed by `@` (for `NUL` 0x00) up to `_` (for `US` 0x1f).  `?` stands for `DEL` 0x7f.
  - This is similar for `^` notation where `^@` stands for `NUL` and `^?` stands for `DEL`.
- `CR` and `LF` can be used interchangeably as line ending.
- `+<TAB>NAME` defines an archive context, see below.  If `<TAB>NAME` is missing, this just creates an archive context without adding to the prefix.
- `-N` leaves N archive contexts.  If `N` is left away it leaves all archive contexts.

Hence:

- Lines end on the first `LF` or `CR` found.
- Empty lines do not have an effect and must be ignored, so `CR` `LF` is a line followed by an empty line.
- Lines starting with `#`, `TAB` or a space character are ignored like empty lines.
- Lines starting with `0`-`9`, `a`-`f` or `A`-`F` can be either prefix lines or hash lines.
- Lines starting with `-` are degnerated hashlines with the `MD5` not present.
- All other lines should trigger an error.
- `TAB` is the separation character between columns.
- Columns cannot be empty.
- `DLE` is the escape character to express reserved codes.
- `DLE` can only show up in the last column.

Prefix-Line or Hash-Line?

- Hash lines always have the format 32 hex digits, `TAB`, 40 hex digits, `TAB`, 64 hex digits, `TAB`, 128 hex digits, `TAB`, filename, followed by `LF` or `CR`.
- So if a line starts with less than 32 hex digits, it must be a prefix.

Initial Prefix:

- The initial prefix is `method` `://` `domain` `/` `filename` `/`
- The `.N` in the `filename.N` is not added
- If `filename` is in a subdirectory, the initial prefix is `method` `://` `domain` `/` `subdirectory` `/` `filename` `/`

Prefix lines:

- `NAME` must not be empty.  Hence if you happen to shorten a prefix, shorten one character more and repeat that character.
- There is no requirement that `NAME` ends on `/`.  However this usually is used by automated scripts.
- `NAME` is used as-is, so nothing is added or removed.  So be sure to include the `/`.

Future compatibility:

- For backwards compatibility, tools which wish to be compatible for future changes must ignore following, but shall output a warning that they are no more current.
- Ignore lines starting with non-control-characters which are not a letter.
- Ignore additional "`TAB` string"-sequences before a `NAME`.  The `NAME` always comes last in a line.
- Lines starting with a control-character (except `TAB`, `CR` and `LF`) are still errors! `DEL` is a control character.
- Lines starting with any character beyond `DEL` are errors, too.
- `DLE` must not show up in other columns than the last one.
- Columns must not be empty, so `TAB` `TAB` in a file is an error (except on ignored lines).

Degenerated hashlines:

- Hashlines can be shortened.  So you can leave away the `SHA1` to `SHA3` if you like.
- If you want to leave away a hash but this would create an empty line, use a `-` instead.

Degenerated files:

- A line `-<TAB>NAME` is a degenerated file.  That is a file, which is present, but does not contain a hash at all.

Special names:

- URLs usually are shortened with `/./` and `/../` sequences.  Nevertheless these are supported.
  - This support is not present on directory level.
  - Escapements is not supported on directory level either.
  - Directories starting with a dot `.` are not supported either on directory level.


## Archives

Hashfinder supports files within files

- For this start it with `+N<TAB>NAME`
  - `NAME` is the new prefix within the archive.  If it shall be empty, just use `+`.
  - You need no `/` to separate things here.  In fact, you should not introduce a `/` because this is confusing (a directory with the same name as a file).
  - `+` can be nested.
- All futher down prefix then is within the archive.
  - All HASHes then refer to the files in the archive.
- You can leave the archive context by following:
  - Either "cut" the prefix more than the prefix is long in the archive
  - Or leave it with a `-` line.

Note that tools should be able to locates files within archives even when there is another URL.

"Archives" are also used for things like a Debian repository "Release" file structure.
This is used for any form of dependency.

