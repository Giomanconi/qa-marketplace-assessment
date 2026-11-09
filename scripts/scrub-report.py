"""Removes test account passwords, session cookies and the sandbox address
from the HTML report before CI uploads it.

Playwright writes `Fill "<value>"` as a step title, a failed API call logs its
request headers (with the `mp_session` cookie), a failed page load names the
full URL, and the report keeps its data in a base64 zip inside index.html.
GitHub masks the APP_URL secret in logs but not in uploaded files, so its host
is replaced with `<sandbox>` here. Fails if any of them is still there, so the
workflow does not upload the report.

Usage: python3 scripts/scrub-report.py playwright-report
"""
import base64
import io
import os
import pathlib
import re
import sys
import zipfile
from urllib.parse import urlparse

PASSWORD = re.compile(rb"Pw-[0-9a-f]{16}-Aa1!")
COOKIE = re.compile(rb"mp_session=(?!\*\*\*)[^;\s\"'\\]+")
HOST = urlparse(os.environ.get("APP_URL", "")).netloc.encode()
MARKER = b"data:application/zip;base64,"
NOT_BASE64 = re.compile(rb"[^A-Za-z0-9+/=]")
TEXT_FILES = {".md", ".txt", ".json", ".html"}


def scrub(data):
    data = COOKIE.sub(b"mp_session=***", PASSWORD.sub(b"***", data))
    if HOST:
        data = data.replace(b"https://" + HOST, b"<sandbox>").replace(HOST, b"<sandbox>")
    return data


def has_secret(data):
    return bool(
        PASSWORD.search(data) or COOKIE.search(data) or (HOST and HOST in data)
    )


def embedded_data(html):
    start = html.index(MARKER) + len(MARKER)
    return start, NOT_BASE64.search(html, start).start()


def scrub_zip(data):
    output = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(data)) as old:
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as new:
            for name in old.namelist():
                new.writestr(name, scrub(old.read(name)))
    return output.getvalue()


def zip_has_secret(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        return any(has_secret(archive.read(n)) for n in archive.namelist())


def main(folder):
    report = pathlib.Path(folder)
    index = report / "index.html"
    if not index.exists():
        print("No report to scrub")
        return 0

    html = index.read_bytes()
    start, end = embedded_data(html)
    clean = scrub_zip(base64.b64decode(html[start:end]))
    index.write_bytes(html[:start] + base64.b64encode(clean) + html[end:])

    for path in report.rglob("*"):
        if path.suffix in TEXT_FILES and path != index:
            path.write_bytes(scrub(path.read_bytes()))

    html = index.read_bytes()
    start, end = embedded_data(html)
    leaks = zip_has_secret(base64.b64decode(html[start:end])) or any(
        has_secret(path.read_bytes())
        for path in report.rglob("*")
        if path.suffix in TEXT_FILES
    )
    if leaks:
        print("The report still holds a password, session cookie or the sandbox address")
        return 1
    print("Report scrubbed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
