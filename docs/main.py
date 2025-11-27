"""MkDocs macros plugin hook to read version from root version.json"""
import json
from pathlib import Path


def define_env(env):
    """Define variables for the mkdocs-macros plugin."""
    # Read version from root version.json
    version_file = Path(__file__).parent.parent / "version.json"
    with open(version_file) as f:
        version_data = json.load(f)

    env.variables["version"] = version_data["version"]
