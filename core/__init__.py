import os
import sys
import logging
import argparse

__version__ = "0.1.0"

def main():
    parser = argparse.ArgumentParser(description="A sample Python script.")
    parser.add_argument("--verbose", action="store_true", help="increase output verbosity")
    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO)
    logging.info("Script started.")
    
    # Your code here

    logging.info("Script finished.")

if __name__ == "__main__":
    main()