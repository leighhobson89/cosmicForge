import os
import zipfile
import argparse
import logging
import subprocess
import shutil
from ftplib import FTP, error_perm
import getpass
import posixpath
import json

# ----------------------------
# CONFIG
# ----------------------------

IGNORE_LIST = [
    ".gitignore", "powerDiagram.graphml", "package.json",
    "package-lock.json", ".vscode", "builds", "dist",
    "icons", ".git", "powerDiagram.png", "techtree.graphml",
    "TEST_POWER.xlsx", "watch_and_run.py", "graph.py",
    "create_build.py", "bugs.txt", "node_modules",
    "temp_build", "html-report", "tools", "tests","cosmicForgeTrailer.mp4"
]

# InfinityFree FTP Config
FTP_HOST = "ftpupload.net"
FTP_USER = "if0_41169177"
FTP_PORT = 21
FTP_REMOTE_DIR = "/htdocs"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)


# ----------------------------
# BUILD FUNCTIONS
# ----------------------------

def copy_files_to_temp(src_dir, temp_dir):
    logging.info("Copying files to temp directory...")
    count = 0

    for root, dirs, files in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_LIST]

        for file_name in files:
            if file_name in IGNORE_LIST:
                continue
            src_path = os.path.join(root, file_name)
            rel_path = os.path.relpath(src_path, src_dir)
            dest_path = os.path.join(temp_dir, rel_path)

            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy2(src_path, dest_path)
            count += 1
            logging.info(f"Copied: {rel_path}")

    logging.info(f"Total files copied: {count}")


def minify_files(root_dir):
    logging.info("Starting minification...")
    total = 0

    for root, dirs, files in os.walk(root_dir):
        for file_name in files:
            file_path = os.path.join(root, file_name)

            if file_name.endswith(".js"):
                logging.info(f"Minifying JS: {file_name}")
                result = subprocess.run(
                    f"npx terser {file_path} -o {file_path} --compress --mangle",
                    shell=True
                )
                if result.returncode == 0:
                    logging.info(f"✔ JS minified: {file_name}")
                else:
                    logging.error(f"✖ JS minify failed: {file_name}")
                total += 1

            elif file_name.endswith(".html"):
                logging.info(f"Minifying HTML: {file_name}")
                result = subprocess.run(
                    f"npx html-minifier "
                    f"--collapse-whitespace "
                    f"--remove-comments "
                    f"--minify-css true "
                    f"--minify-js true "
                    f"-o {file_path} {file_path}",
                    shell=True
                )
                if result.returncode == 0:
                    logging.info(f"✔ HTML minified: {file_name}")
                else:
                    logging.error(f"✖ HTML minify failed: {file_name}")
                total += 1

    logging.info(f"Total files minified: {total}")


def create_build_zip(zip_name, temp_dir):
    logging.info("Creating build zip...")
    builds_dir = os.path.join(os.getcwd(), "builds")
    os.makedirs(builds_dir, exist_ok=True)

    zip_path = os.path.join(builds_dir, zip_name)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(temp_dir):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                zip_file.write(file_path, os.path.relpath(file_path, temp_dir))

    logging.info(f"Zip created: {zip_path}")
    return zip_path


# ----------------------------
# DEPLOY: ITCH.IO
# ----------------------------

def deploy_itch(zip_path, build_name):
    logging.info("Deploying to itch.io...")
    butler_command = f"butler push {zip_path} leighhobson89/cosmic-forge:{build_name}"
    subprocess.run(butler_command, shell=True, check=True)
    logging.info("Itch.io deployment complete.")


# ----------------------------
# FTP HELPERS
# ----------------------------

def _safe_nlst(ftp):
    try:
        items = ftp.nlst()
        return [i for i in items if i not in ('.', '..')]
    except Exception:
        return []


def clear_remote_directory(ftp, path):
    logging.info(f"Clearing remote directory: {path}")

    original_dir = ftp.pwd()
    try:
        ftp.cwd(path)
    except Exception as e:
        logging.error(f"Could not cwd into {path}: {e}")
        return

    items = _safe_nlst(ftp)

    for name in items:
        if name in ('.', '..'):
            continue

        try:
            ftp.delete(name)
            logging.info(f"Deleted file: {posixpath.join(path, name)}")
            continue
        except Exception:
            pass

        try:
            clear_remote_directory(ftp, name)
            ftp.rmd(name)
            logging.info(f"Deleted folder: {posixpath.join(path, name)}")
        except Exception as e:
            logging.error(f"Failed deleting {posixpath.join(path, name)}: {e}")

    try:
        ftp.cwd(original_dir)
    except Exception:
        pass


def upload_directory_ftp(local_dir, ftp_password):
    ftp = FTP()
    ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
    ftp.login(FTP_USER, ftp_password)
    ftp.cwd(FTP_REMOTE_DIR)

    logging.info("Connected to FTP.")

    logging.info("Uploading build (incremental)...")
    total_uploaded = 0
    total_skipped = 0
    total_failed = 0

    manifest_path = os.path.join(os.getcwd(), ".ftp_manifest.json")
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception:
        manifest = {}

    def save_manifest():
        try:
            with open(manifest_path, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to write manifest: {e}")

    def ensure_remote_dir(relative_dir):
        relative_dir = str(relative_dir).replace('\\', '/').strip('/')
        if not relative_dir:
            return

        current = ftp.pwd()
        try:
            ftp.cwd(FTP_REMOTE_DIR)
            for part in relative_dir.split('/'):
                if not part:
                    continue
                try:
                    ftp.mkd(part)
                    logging.info(f"Created remote dir: {posixpath.join(FTP_REMOTE_DIR, relative_dir)}")
                except Exception:
                    pass
                ftp.cwd(part)
        finally:
            ftp.cwd(current)

    def remote_file_signature(remote_file_name):
        size = None
        mdtm = None

        try:
            size = ftp.size(remote_file_name)
        except Exception:
            pass

        try:
            resp = ftp.sendcmd(f"MDTM {remote_file_name}")
            if isinstance(resp, str) and resp.startswith('213 '):
                mdtm = resp[4:].strip()
        except Exception:
            pass

        return size, mdtm

    def should_upload_file(local_file_path, remote_file_name):
        try:
            local_size = os.path.getsize(local_file_path)
        except OSError:
            return True

        local_mtime = None
        try:
            local_mtime = int(os.path.getmtime(local_file_path))
        except OSError:
            pass

        remote_size, remote_mdtm = remote_file_signature(remote_file_name)

        if remote_size is None and remote_mdtm is None:
            return True

        if remote_size is not None and int(remote_size) != int(local_size):
            return True

        if local_mtime is not None and remote_mdtm:
            try:
                from datetime import datetime, timezone
                remote_dt = datetime.strptime(remote_mdtm, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
                remote_epoch = int(remote_dt.timestamp())
                if abs(remote_epoch - local_mtime) > 2:
                    return True
            except Exception:
                return True

        return False

    for root, dirs, files in os.walk(local_dir):
        rel_path = os.path.relpath(root, local_dir)
        rel_path = rel_path.replace('\\', '/')

        if rel_path != ".":
            ensure_remote_dir(rel_path)
            ftp.cwd(posixpath.join(FTP_REMOTE_DIR, rel_path))

        for file in files:
            local_file = os.path.join(root, file)

            rel_file_path = file if rel_path == "." else f"{rel_path}/{file}"
            try:
                local_size = os.path.getsize(local_file)
            except OSError:
                local_size = None
            try:
                local_mtime = int(os.path.getmtime(local_file))
            except OSError:
                local_mtime = None

            previous = manifest.get(rel_file_path)
            if (
                isinstance(previous, dict) and
                previous.get("size") == local_size and
                previous.get("mtime") == local_mtime
            ):
                total_skipped += 1
                continue

            upload = True
            if previous is None:
                upload = should_upload_file(local_file, file)

            if upload:
                try:
                    with open(local_file, "rb") as f:
                        ftp.storbinary(f"STOR {file}", f)
                    logging.info(f"Uploaded: {rel_path}/{file}")
                    total_uploaded += 1
                    manifest[rel_file_path] = {"size": local_size, "mtime": local_mtime}
                except Exception as e:
                    total_failed += 1
                    logging.error(f"Upload failed: {rel_file_path} ({e})")
            else:
                total_skipped += 1

        ftp.cwd(FTP_REMOTE_DIR)

    ftp.quit()
    save_manifest()
    logging.info(f"Upload complete. Uploaded: {total_uploaded} | Skipped: {total_skipped} | Failed: {total_failed}")


# ----------------------------
# MAIN
# ----------------------------

def main():
    parser = argparse.ArgumentParser(description="Create and deploy a build.")
    parser.add_argument("build_name", type=str)
    args = parser.parse_args()

    zip_file_name = f"cosmicForge_Build_{args.build_name}.zip"

    project_root = os.getcwd()
    temp_dir = os.path.join(project_root, "temp_build")
    os.makedirs(temp_dir, exist_ok=True)

    try:
        copy_files_to_temp(project_root, temp_dir)
        minify_files(temp_dir)
        zip_path = create_build_zip(zip_file_name, temp_dir)

        # ITCH.IO
        itch_choice = input("Push to itch.io? (Y/N): ").strip().upper()
        if itch_choice == "Y":
            deploy_itch(zip_path, args.build_name)

        # INFINITYFREE
        infinity_choice = input("Push to InfinityFree (incremental FTP upload)? (Y/N): ").strip().upper()
        if infinity_choice == "Y":
            ftp_password = os.environ.get("COSMICFORGE_FTP_PASSWORD")
            ftp_password = ftp_password.strip() if isinstance(ftp_password, str) else None
            if not ftp_password:
                ftp_password = getpass.getpass("Enter FTP password: ")
            upload_directory_ftp(temp_dir, ftp_password)

    finally:
        logging.info("Cleaning up temp directory...")
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
