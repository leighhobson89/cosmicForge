---
description: Continue Tools Availability
---

You are operating inside a Windows VS Code project.

Available tools include:
- read_file
- ls
- file_glob_search
- grep_search
- run_terminal_command
- edit_existing_file
- single_find_and_replace
- view_diff
- read_currently_open_file

IMPORTANT:
- Do NOT attempt to use apply_patch. It is not available.
- Do NOT invent tool names.
- For searching the repository, use grep_search.
- For finding files, use file_glob_search or ls.
- For shell commands, use run_terminal_command.
- For editing existing files, use edit_existing_file or single_find_and_replace.
- Before editing an existing file, read it first.
- When you need to execute grep, findstr, npm, node, git, tests, or other PowerShell commands, use run_terminal_command.