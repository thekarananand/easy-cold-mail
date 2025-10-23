import pandas as pd
import glob
import os

# --- 1. Configuration ---
# IMPORTANT: Change this to the folder where all your CSVs are saved.
# Use 'r' before the string on Windows to handle backslashes correctly.
PATH_TO_CSVS = "."

# The name of your final, merged file
OUTPUT_FILENAME = "./MERGED_jobs.csv"
# ------------------------


def merge_job_csvs(csv_path, output_file):
    """
    Finds all CSV files in a path, merges them, removes duplicates
    based on the 'Link' column, and saves to a new file.
    """
    
    # 1. Create the full search pattern
    # This will find any file ending in .csv in your folder
    search_pattern = os.path.join(csv_path, "*.csv")
    
    # 2. Find all files matching the pattern
    all_files = glob.glob(search_pattern)
    
    if not all_files:
        print(f"Error: No CSV files found in the directory: {csv_path}")
        print("Please check your 'PATH_TO_CSVS' variable.")
        return

    print(f"Found {len(all_files)} CSV files. Starting merge...")

    # 3. Read each CSV into a pandas DataFrame and put them in a list
    list_of_dfs = [pd.read_csv(file) for file in all_files]

    # 4. Concatenate (stack) all DataFrames into one
    merged_df = pd.concat(list_of_dfs, ignore_index=True)
    
    print(f"Total rows from all files: {len(merged_df)}")

    # 5. Remove duplicates
    if 'Link' in merged_df.columns:
        original_rows = len(merged_df)
        # Keep the 'first' instance of each unique link
        merged_df.drop_duplicates(subset=['Link'], keep='first', inplace=True)
        duplicates_removed = original_rows - len(merged_df)
        print(f"Removed {duplicates_removed} duplicate job listings.")
    else:
        print("Warning: 'Link' column not found. Cannot remove duplicates.")

    # 6. Save the final, clean DataFrame to a new CSV
    output_path = os.path.join(csv_path, output_file)
    try:
        merged_df.to_csv(output_path, index=False)
        print(f"\nSuccess! ✨")
        print(f"Merged file saved to: {output_path}")
        print(f"Final file contains {len(merged_df)} unique job listings.")
    except Exception as e:
        print(f"\nError: Could not save the file. {e}")
        print("Please check if the file is already open or if you have permissions.")

# --- Run the function ---
if __name__ == "__main__":
    merge_job_csvs(PATH_TO_CSVS, OUTPUT_FILENAME)
